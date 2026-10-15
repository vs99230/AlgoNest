"""Execute function-style solutions in Judge0 against the problem examples."""

from __future__ import annotations

import ast
import base64
import json
import logging
import re
from typing import Any

import httpx
from fastapi import HTTPException

from app.core.config import get_settings

_LANGUAGE_IDS = {"python": 71, "javascript": 63, "cpp": 54, "java": 62}
_logger = logging.getLogger(__name__)


def _method_signature(problem: dict) -> tuple[str, list[str]]:
    starter = problem.get("starterCode", {}).get("python", "")
    match = re.search(r"def\s+([A-Za-z_]\w*)\s*\(\s*self\s*,?\s*([^)]*)\)", starter)
    if not match:
        raise HTTPException(422, "Problem is missing a supported Python method signature.")
    params = [part.strip().split(":")[0].strip() for part in match.group(2).split(",") if part.strip()]
    return match.group(1), params


def _split_assignments(text: str) -> dict[str, Any]:
    parts: list[str] = []
    start = 0
    depth = 0
    quote: str | None = None
    escaped = False
    for index, char in enumerate(text):
        if quote:
            if escaped:
                escaped = False
            elif char == "\\":
                escaped = True
            elif char == quote:
                quote = None
        elif char in {"'", '"'}:
            quote = char
        elif char in "[({":
            depth += 1
        elif char in "])}":
            depth -= 1
        elif char == "," and depth == 0:
            parts.append(text[start:index].strip())
            start = index + 1
    parts.append(text[start:].strip())

    result: dict[str, Any] = {}
    for part in parts:
        name, separator, raw_value = part.partition("=")
        if not separator or not re.fullmatch(r"[A-Za-z_]\w*", name.strip()):
            raise ValueError(f"Unsupported example input: {text}")
        result[name.strip()] = ast.literal_eval(_pythonize_literals(raw_value.strip()))
    return result


def _pythonize_literals(value: str) -> str:
    replacements = {"true": "True", "false": "False", "null": "None"}
    output: list[str] = []
    quote: str | None = None
    escaped = False
    index = 0
    while index < len(value):
        char = value[index]
        if quote:
            output.append(char)
            if escaped:
                escaped = False
            elif char == "\\":
                escaped = True
            elif char == quote:
                quote = None
            index += 1
            continue
        if char in {"'", '"'}:
            quote = char
            output.append(char)
            index += 1
            continue
        match = re.match(r"[A-Za-z]+", value[index:])
        if match:
            token = match.group(0)
            output.append(replacements.get(token.lower(), token))
            index += len(token)
            continue
        output.append(char)
        index += 1
    return "".join(output)


def _python_source(code: str, method: str, params: list[str], args: list[Any], slug: str) -> str:
    values = json.dumps(args, separators=(",", ":"))
    cycle_setup = ""
    if "head" in params and "pos" in params:
        cycle_setup = (
            "    __head = __algonest_args[" + str(params.index("head")) + "]\n"
            "    __pos = __algonest_args[" + str(params.index("pos")) + "]\n"
            "    __tail = __head; __target = None; __index = 0\n"
            "    while __tail and __tail.next:\n"
            "        if __index == __pos: __target = __tail\n"
            "        __tail = __tail.next; __index += 1\n"
            "    if __tail and __index == __pos: __target = __tail\n"
            "    if __tail and __target: __tail.next = __target\n"
        )
    return (
        "class ListNode:\n"
        "    def __init__(self, val=0, next=None): self.val, self.next = val, next\n"
        "class TreeNode:\n"
        "    def __init__(self, val=0, left=None, right=None): self.val, self.left, self.right = val, left, right\n"
        "class Node:\n"
        "    def __init__(self, val=0, neighbors=None): self.val, self.neighbors = val, neighbors or []\n"
        + code
        + "\nimport json\n"
        + f"__algonest_args = json.loads({values!r})\n"
        + "__algonest_root = None\n"
        + "def __algonest_list_node(values):\n"
        + "    dummy = ListNode(); tail = dummy\n"
        + "    for value in values or []: tail.next = ListNode(value); tail = tail.next\n"
        + "    return dummy.next\n"
        + "def __algonest_tree(values):\n"
        + "    if not values or values[0] is None: return None\n"
        + "    root = TreeNode(values[0]); queue = [root]; i = 1\n"
        + "    for node in queue:\n"
        + "        if i < len(values) and values[i] is not None: node.left = TreeNode(values[i]); queue.append(node.left)\n"
        + "        i += 1\n"
        + "        if i < len(values) and values[i] is not None: node.right = TreeNode(values[i]); queue.append(node.right)\n"
        + "        i += 1\n"
        + "    return root\n"
        + "def __algonest_find(root, value):\n"
        + "    queue = [root] if root else []\n"
        + "    while queue:\n"
        + "        node = queue.pop(0)\n"
        + "        if node.val == value: return node\n"
        + "        if node.left: queue.append(node.left)\n"
        + "        if node.right: queue.append(node.right)\n"
        + "    return None\n"
        + "def __algonest_graph(adjacency):\n"
        + "    nodes = [Node(i + 1) for i in range(len(adjacency))]\n"
        + "    for i, neighbors in enumerate(adjacency): nodes[i].neighbors = [nodes[value - 1] for value in neighbors]\n"
        + "    return nodes[0] if nodes else None\n"
        + "def __algonest_serialize(value):\n"
        + "    if isinstance(value, ListNode):\n"
        + "        result = []; seen = set()\n"
        + "        while value and id(value) not in seen: seen.add(id(value)); result.append(value.val); value = value.next\n"
        + "        return result\n"
        + "    if isinstance(value, TreeNode):\n"
        + ( "        return value.val\n" if slug == "lowest-common-ancestor-of-a-binary-tree" else "" )
        + "        result = []; queue = [value]\n"
        + "        while queue:\n"
        + "            node = queue.pop(0); result.append(node.val if node else None)\n"
        + "            if node: queue.extend([node.left, node.right])\n"
        + "        while result and result[-1] is None: result.pop()\n"
        + "        return result\n"
        + "    if isinstance(value, Node):\n"
        + "        nodes = [value]; indexes = {id(value): 0}\n"
        + "        for node in nodes:\n"
        + "            for neighbor in node.neighbors:\n"
        + "                if id(neighbor) not in indexes: indexes[id(neighbor)] = len(nodes); nodes.append(neighbor)\n"
        + "        nodes.sort(key=lambda node: node.val)\n"
        + "        return [[neighbor.val for neighbor in node.neighbors] for node in nodes]\n"
        + "    return value\n"
        + "for __i, __name in enumerate(" + repr(params) + "):\n"
        + "    if __name in {'head', 'list1', 'list2'} and isinstance(__algonest_args[__i], list): __algonest_args[__i] = __algonest_list_node(__algonest_args[__i])\n"
        + "    elif __name == 'root': __algonest_args[__i] = __algonest_tree(__algonest_args[__i]); __algonest_root = __algonest_args[__i]\n"
        + "    elif __name in {'p', 'q'} and isinstance(__algonest_args[__i], list): __algonest_args[__i] = __algonest_tree(__algonest_args[__i])\n"
        + "    elif __name in {'p', 'q'} and isinstance(__algonest_args[__i], int): __algonest_args[__i] = __algonest_find(__algonest_root, __algonest_args[__i])\n"
        + "    elif __name == 'node' and isinstance(__algonest_args[__i], list): __algonest_args[__i] = __algonest_graph(__algonest_args[__i])\n"
        + ("if 'head' in " + repr(params) + " and 'pos' in " + repr(params) + ":\n" + cycle_setup if cycle_setup else "")
        + f"__algonest_result = Solution().{method}(*__algonest_args)\n"
        + "if __algonest_result is None and __algonest_args:\n"
        + "    __algonest_result = __algonest_args[0]\n"
        + "print(json.dumps(__algonest_serialize(__algonest_result), separators=(',', ':')))\n"
    )


def _javascript_source(code: str, method: str, params: list[str], args: list[Any], slug: str) -> str:
    values = json.dumps(args, separators=(",", ":"))
    return (
        "class ListNode { constructor(val = 0, next = null) { this.val = val; this.next = next; } }\n"
        "class TreeNode { constructor(val = 0, left = null, right = null) { this.val = val; this.left = left; this.right = right; } }\n"
        "class Node { constructor(val = 0, neighbors = []) { this.val = val; this.neighbors = neighbors; } }\n"
        + code
        + f"\nconst __algonest_args = {values};\n"
        + f"const __algonest_params = {json.dumps(params)};\n"
        + "function __algonest_list(values) { const dummy = new ListNode(); let tail = dummy; for (const value of values || []) { tail.next = new ListNode(value); tail = tail.next; } return dummy.next; }\n"
        + "function __algonest_tree(values) { if (!values || !values.length || values[0] == null) return null; const root = new TreeNode(values[0]); const queue = [root]; let i = 1; for (let j = 0; j < queue.length && i < values.length; j++) { const node = queue[j]; if (i < values.length && values[i] != null) { node.left = new TreeNode(values[i]); queue.push(node.left); } i++; if (i < values.length && values[i] != null) { node.right = new TreeNode(values[i]); queue.push(node.right); } i++; } return root; }\n"
        + "function __algonest_find(root, value) { const queue = root ? [root] : []; for (let i = 0; i < queue.length; i++) { const node = queue[i]; if (node.val === value) return node; if (node.left) queue.push(node.left); if (node.right) queue.push(node.right); } return null; }\n"
        + "function __algonest_graph(adjacency) { const nodes = adjacency.map((_, i) => new Node(i + 1)); adjacency.forEach((neighbors, i) => { nodes[i].neighbors = neighbors.map(value => nodes[value - 1]); }); return nodes[0] || null; }\n"
        + "let __algonest_root = null;\n"
        + "__algonest_params.forEach((name, i) => { const value = __algonest_args[i]; if (['head','list1','list2'].includes(name) && Array.isArray(value)) __algonest_args[i] = __algonest_list(value); else if (name === 'root') { __algonest_args[i] = __algonest_tree(value); __algonest_root = __algonest_args[i]; } else if (['p','q'].includes(name) && Array.isArray(value)) __algonest_args[i] = __algonest_tree(value); else if (['p','q'].includes(name) && Number.isInteger(value) && __algonest_root) __algonest_args[i] = __algonest_find(__algonest_root, value); else if (name === 'node' && Array.isArray(value)) __algonest_args[i] = __algonest_graph(value); });\n"
        + "if (__algonest_params.includes('head') && __algonest_params.includes('pos')) { const head = __algonest_args[__algonest_params.indexOf('head')]; const pos = __algonest_args[__algonest_params.indexOf('pos')]; let tail = head; let target = null; let index = 0; while (tail && tail.next) { if (index === pos) target = tail; tail = tail.next; index++; } if (tail && index === pos) target = tail; if (tail && target) tail.next = target; }\n"
        + "function __algonest_serialize(value) { if (value instanceof ListNode) { const out = []; const seen = new Set(); while (value && !seen.has(value)) { seen.add(value); out.push(value.val); value = value.next; } return out; } if (value instanceof TreeNode) { if ("
        + json.dumps(slug == "lowest-common-ancestor-of-a-binary-tree")
        + ") return value.val; const out = []; const queue = [value]; for (let i = 0; i < queue.length; i++) { const node = queue[i]; out.push(node ? node.val : null); if (node) queue.push(node.left, node.right); } while (out.length && out[out.length - 1] === null) out.pop(); return out; } if (value instanceof Node) { const nodes = [value]; const seen = new Set(nodes); for (let i = 0; i < nodes.length; i++) for (const neighbor of nodes[i].neighbors) if (!seen.has(neighbor)) { seen.add(neighbor); nodes.push(neighbor); } nodes.sort((a,b) => a.val-b.val); return nodes.map(node => node.neighbors.map(neighbor => neighbor.val)); } return value; }\n"
        + f"const __algonest_result = {method}(...__algonest_args);\n"
        + "console.log(JSON.stringify(__algonest_serialize(__algonest_result === undefined ? __algonest_args[0] : __algonest_result)));\n"
    )


def _cpp_source(problem: dict, code: str, method: str, args: list[Any]) -> str:
    starter = problem["starterCode"]["cpp"]
    declaration = re.search(rf"\b{re.escape(method)}\s*\((.*?)\)", starter, re.DOTALL)
    if not declaration:
        raise HTTPException(422, f"No C++ signature found for {method}.")
    declarations = _split_cpp_parameters(declaration.group(1))
    if len(declarations) != len(args):
        raise HTTPException(422, "C++ method signature does not match the example arguments.")
    locals_: list[str] = []
    call_args: list[str] = []
    params = []
    for index, (decl, value) in enumerate(zip(declarations, args)):
        match = re.match(r"(.+?)\s+(\w+)\s*$", decl.strip())
        if not match:
            raise HTTPException(422, f"Unsupported C++ parameter declaration: {decl}")
        declared_type, param_name = match.group(1).strip(), match.group(2)
        type_name, name = declared_type.replace("const ", "").replace("&", "").strip(), f"__arg{index}"
        params.append(param_name)
        if type_name == "ListNode*":
            locals_.append(f"ListNode* {name} = __algonest_list({_cpp_literal(value, 'vector<int>')});")
        elif type_name == "TreeNode*":
            if param_name in {"p", "q"} and isinstance(value, int):
                root_index = params.index("root") if "root" in params else None
                root_name = f"__arg{root_index}" if root_index is not None else "nullptr"
                locals_.append(f"TreeNode* {name} = __algonest_find({root_name}, {value});")
            else:
                locals_.append(f"TreeNode* {name} = __algonest_tree({_cpp_tree_literal(value)});")
        elif type_name == "Node*":
            locals_.append(f"Node* {name} = __algonest_graph({_cpp_literal(value, 'vector<vector<int>>')});")
        else:
            locals_.append(f"{type_name} {name} = {_cpp_literal(value, type_name)};")
        call_args.append(name)
    if "head" in params and "pos" in params:
        head_index, pos_index = params.index("head"), params.index("pos")
        locals_.append(f"__algonest_cycle(__arg{head_index}, __arg{pos_index});")
    is_void = bool(re.search(rf"\bvoid\s+{re.escape(method)}\s*\(", starter))
    return (
        "#include <bits/stdc++.h>\nusing namespace std;\n"
        + "struct ListNode { int val; ListNode* next; ListNode(int x=0,ListNode* n=nullptr):val(x),next(n){} };\n"
        + "struct TreeNode { int val; TreeNode* left; TreeNode* right; TreeNode(int x=0,TreeNode* l=nullptr,TreeNode* r=nullptr):val(x),left(l),right(r){} };\n"
        + "struct Node { int val; vector<Node*> neighbors; Node(int x=0):val(x){} };\n"
        + code
        + "\ntemplate<class T> void __print(const T& x){ cout << x; }\n"
        + "inline void __print(bool x){ cout << (x ? \"true\" : \"false\"); }\n"
        + "inline void __print(const string& x){ cout << '\"' << x << '\"'; }\n"
        + "inline void __print(char x){ cout << '\"' << x << '\"'; }\n"
        + "template<class T> void __print(const vector<T>& v){ cout << '['; for(size_t i=0;i<v.size();++i){if(i) cout << ','; __print(v[i]);} cout << ']';}\n"
        + "ListNode* __algonest_list(vector<int> v){ ListNode d; auto t=&d; for(int x:v){t->next=new ListNode(x);t=t->next;} return d.next; }\n"
        + "TreeNode* __algonest_tree(vector<int> v){ if(v.empty()||v[0]==INT_MIN)return nullptr; auto r=new TreeNode(v[0]); vector<TreeNode*> q{r}; size_t i=1; for(size_t j=0;j<q.size()&&i<v.size();j++){auto n=q[j]; if(i<v.size()&&v[i]!=INT_MIN){n->left=new TreeNode(v[i]);q.push_back(n->left);}i++;if(i<v.size()&&v[i]!=INT_MIN){n->right=new TreeNode(v[i]);q.push_back(n->right);}i++;}return r; }\n"
        + "TreeNode* __algonest_find(TreeNode* r,int x){ if(!r)return nullptr; queue<TreeNode*>q;q.push(r);while(!q.empty()){auto n=q.front();q.pop();if(n->val==x)return n;if(n->left)q.push(n->left);if(n->right)q.push(n->right);}return nullptr; }\n"
        + "Node* __algonest_graph(vector<vector<int>> a){vector<Node*> n;for(int i=0;i<(int)a.size();i++)n.push_back(new Node(i+1));for(int i=0;i<(int)a.size();i++)for(int x:a[i])n[i]->neighbors.push_back(n[x-1]);return n.empty()?nullptr:n[0];}\n"
        + "void __algonest_cycle(ListNode* h,int p){if(p<0)return;auto t=h;ListNode* target=nullptr;int i=0;while(t&&t->next){if(i==p)target=t;t=t->next;i++;}if(t&&i==p)target=t;if(t&&target)t->next=target;}\n"
        + "void __print(ListNode* n){cout<<'[';bool first=true;unordered_set<ListNode*>s;while(n&&s.insert(n).second){if(!first)cout<<',';first=false;cout<<n->val;n=n->next;}cout<<']';}\n"
        + ( "void __print(TreeNode* n){if(n)cout<<n->val;else cout<<\"null\";}\n" if problem["slug"] == "lowest-common-ancestor-of-a-binary-tree" else "void __print(TreeNode* n){vector<string>v;queue<TreeNode*>q;if(n)q.push(n);while(!q.empty()){auto x=q.front();q.pop();if(!x){v.push_back(\"null\");continue;}v.push_back(to_string(x->val));q.push(x->left);q.push(x->right);}while(!v.empty()&&v.back()==\"null\")v.pop_back();cout<<'[';for(size_t i=0;i<v.size();i++){if(i)cout<<',';cout<<v[i];}cout<<']';}\n" )
        + "void __print(Node* n){vector<Node*>v;if(n)v.push_back(n);unordered_set<Node*>s;if(n)s.insert(n);for(size_t i=0;i<v.size();i++)for(auto x:v[i]->neighbors)if(s.insert(x).second)v.push_back(x);sort(v.begin(),v.end(),[](auto a,auto b){return a->val<b->val;});cout<<'[';for(size_t i=0;i<v.size();i++){if(i)cout<<',';cout<<'[';for(size_t j=0;j<v[i]->neighbors.size();j++){if(j)cout<<',';cout<<v[i]->neighbors[j]->val;}cout<<']';}cout<<']';}\n"
        + "int main(){ Solution __solution; "
        + " ".join(locals_)
        + (
            f" __solution.{method}({', '.join(call_args)}); "
            + (f"__print({call_args[0]}); " if call_args else "")
            if is_void
            else f" auto __result = __solution.{method}({', '.join(call_args)}); __print(__result); "
        )
        + "}\n"
    )


def _split_cpp_parameters(text: str) -> list[str]:
    items: list[str] = []
    start = 0
    depth = 0
    for index, char in enumerate(text):
        if char == "<":
            depth += 1
        elif char == ">":
            depth -= 1
        elif char == "," and depth == 0:
            items.append(text[start:index].strip())
            start = index + 1
    if text.strip():
        items.append(text[start:].strip())
    return items


def _cpp_literal(value: Any, type_name: str) -> str:
    if type_name.startswith("vector<"):
        inner = type_name[len("vector<"):-1].strip()
        return "{" + ", ".join(_cpp_literal(item, inner) for item in value) + "}"
    if type_name == "string":
        return json.dumps(value)
    if type_name == "char":
        return "'" + str(value).replace("\\", "\\\\").replace("'", "\\'") + "'"
    if type_name == "bool":
        return "true" if value else "false"
    if value is None:
        return "nullptr"
    return str(value)


def _cpp_tree_literal(value: list[Any]) -> str:
    return "{" + ", ".join("INT_MIN" if item is None else str(item) for item in value) + "}"


def _java_source(problem: dict, code: str, method: str, args: list[Any]) -> str:
    starter = problem["starterCode"]["java"]
    declaration = re.search(rf"\b{re.escape(method)}\s*\((.*?)\)", starter, re.DOTALL)
    if not declaration:
        raise HTTPException(422, f"No Java signature found for {method}.")
    declarations = [part.strip() for part in declaration.group(1).split(",") if part.strip()]
    if len(declarations) != len(args):
        raise HTTPException(422, "Java method signature does not match the example arguments.")
    locals_: list[str] = []
    call_args: list[str] = []
    params: list[str] = []
    for index, (decl, value) in enumerate(zip(declarations, args)):
        match = re.match(r"(.+?)\s+(\w+)\s*$", decl)
        if not match:
            raise HTTPException(422, f"Unsupported Java parameter declaration: {decl}")
        type_name, param_name, name = match.group(1).strip(), match.group(2), f"__arg{index}"
        params.append(param_name)
        if type_name == "ListNode":
            locals_.append(f"ListNode {name} = Main.list({_java_literal(value, 'int[]')});")
        elif type_name == "TreeNode":
            if param_name in {"p", "q"} and isinstance(value, int) and "root" in params:
                root_name = f"__arg{params.index('root')}"
                locals_.append(f"TreeNode {name} = Main.find({root_name}, {value});")
            else:
                locals_.append(f"TreeNode {name} = Main.tree({_java_literal(value, 'Integer[]')});")
        elif type_name == "Node":
            locals_.append(f"Node {name} = Main.graph({_java_literal(value, 'int[][]')});")
        else:
            locals_.append(f"{type_name} {name} = {_java_literal(value, type_name)};")
        call_args.append(name)
    cycle_setup = ""
    if "head" in params and "pos" in params:
        cycle_setup = (
            f" Main.cycle(__arg{params.index('head')}, __arg{params.index('pos')});"
        )
    scalar_tree_result = problem["slug"] == "lowest-common-ancestor-of-a-binary-tree"
    return (
        "import java.lang.reflect.*; import java.util.*;\n"
        "class ListNode { int val; ListNode next; ListNode(int v){val=v;} }\n"
        "class TreeNode { int val; TreeNode left,right; TreeNode(int v){val=v;} }\n"
        "class Node { int val; List<Node> neighbors=new ArrayList<>(); Node(int v){val=v;} }\n"
        + code
        + "\nclass Main {"
        + " static ListNode list(int[] a){ListNode d=new ListNode(0),t=d;for(int v:a){t.next=new ListNode(v);t=t.next;}return d.next;}"
        + " static TreeNode tree(Integer[] a){if(a.length==0||a[0]==null)return null;TreeNode r=new TreeNode(a[0]);List<TreeNode>q=new ArrayList<>();q.add(r);int i=1;for(int j=0;j<q.size()&&i<a.length;j++){TreeNode n=q.get(j);if(i<a.length&&a[i]!=null){n.left=new TreeNode(a[i]);q.add(n.left);}i++;if(i<a.length&&a[i]!=null){n.right=new TreeNode(a[i]);q.add(n.right);}i++;}return r;}"
        + " static TreeNode find(TreeNode r,int v){if(r==null)return null;Queue<TreeNode>q=new LinkedList<>();q.add(r);while(!q.isEmpty()){TreeNode n=q.remove();if(n.val==v)return n;if(n.left!=null)q.add(n.left);if(n.right!=null)q.add(n.right);}return null;}"
        + " static Node graph(int[][] a){Node[] n=new Node[a.length];for(int i=0;i<a.length;i++)n[i]=new Node(i+1);for(int i=0;i<a.length;i++)for(int v:a[i])n[i].neighbors.add(n[v-1]);return n.length==0?null:n[0];}"
        + " static void cycle(ListNode h,int p){if(p<0)return;ListNode t=h,target=null;int i=0;while(t!=null&&t.next!=null){if(i==p)target=t;t=t.next;i++;}if(t!=null&&i==p)target=t;if(t!=null&&target!=null)t.next=target;}"
        + " static String json(Object x) throws Exception {"
        + " if(x==null)return \"null\"; if(x instanceof Boolean || x instanceof Number)return x.toString();"
        + " if(x instanceof String)return \"\\\"\"+x.toString().replace(\"\\\\\",\"\\\\\\\\\").replace(\"\\\"\",\"\\\\\\\"\")+\"\\\"\";"
        + " if(x.getClass().isArray()){StringBuilder b=new StringBuilder(\"[\"); for(int i=0;i<Array.getLength(x);i++){if(i>0)b.append(',');b.append(json(Array.get(x,i)));}return b.append(']').toString();}"
        + " if(x instanceof Iterable){StringBuilder b=new StringBuilder(\"[\");boolean first=true;for(Object v:(Iterable<?>)x){if(!first)b.append(',');first=false;b.append(json(v));}return b.append(']').toString();}"
        + " if(x instanceof ListNode){List<Object>v=new ArrayList<>();Set<ListNode>s=Collections.newSetFromMap(new IdentityHashMap<>());ListNode n=(ListNode)x;while(n!=null&&s.add(n)){v.add(n.val);n=n.next;}return json(v);}"
        + ( " if(x instanceof TreeNode)return json(((TreeNode)x).val);" if scalar_tree_result else " if(x instanceof TreeNode){List<Object>v=new ArrayList<>();List<TreeNode>q=new ArrayList<>();q.add((TreeNode)x);for(int i=0;i<q.size();i++){TreeNode n=q.get(i);v.add(n==null?null:n.val);if(n!=null){q.add(n.left);q.add(n.right);}}while(!v.isEmpty()&&v.get(v.size()-1)==null)v.remove(v.size()-1);return json(v);}" )
        + " if(x instanceof Node){List<Node>v=new ArrayList<>();Set<Node>s=Collections.newSetFromMap(new IdentityHashMap<>());v.add((Node)x);s.add((Node)x);for(int i=0;i<v.size();i++)for(Node n:v.get(i).neighbors)if(s.add(n))v.add(n);v.sort(Comparator.comparingInt(n->n.val));List<Object>out=new ArrayList<>();for(Node n:v){List<Integer>a=new ArrayList<>();for(Node m:n.neighbors)a.add(m.val);out.add(a);}return json(out);}"
        + " return json(x.toString()); }"
        + " public static void main(String[] z) throws Exception { Solution s=new Solution(); "
        + " ".join(locals_)
        + cycle_setup
        + (
            f" s.{method}({', '.join(call_args)});"
            + (f" System.out.print(json({call_args[0]}));" if call_args else "")
            if re.search(rf"\bvoid\s+{re.escape(method)}\s*\(", starter)
            else f" Object r=s.{method}({', '.join(call_args)});"
            + (f" if(r==null) r={call_args[0]};" if call_args else "")
            + " System.out.print(json(r));"
        )
        + " } }\n"
    )


def _java_literal(value: Any, type_name: str) -> str:
    if type_name.startswith("List<") and type_name.endswith(">"):
        inner = type_name[len("List<"):-1].strip()
        return "Arrays.asList(" + ", ".join(_java_literal(item, inner) for item in value) + ")"
    if type_name.endswith("[]"):
        inner = type_name[:-2]
        return f"new {inner}[]{{{', '.join(_java_literal(item, inner) for item in value)}}}"
    if type_name == "String":
        return json.dumps(value)
    if type_name == "char":
        return "'" + str(value).replace("\\", "\\\\").replace("'", "\\'") + "'"
    if type_name == "boolean":
        return "true" if value else "false"
    if value is None:
        return "null"
    return str(value)


def _build_source(problem: dict, language: str, code: str, method: str, params: list[str], args: list[Any]) -> str:
    if language == "python":
        return _python_source(code, method, params, args, problem["slug"])
    if language == "javascript":
        return _javascript_source(code, method, params, args, problem["slug"])
    if language == "cpp":
        return _cpp_source(problem, code, method, args)
    if language == "java":
        return _java_source(problem, code, method, args)
    raise HTTPException(422, f"Unsupported language: {language}")


def _normalized_output(value: str | None) -> str:
    if value is None:
        return ""
    value = value.strip()
    try:
        return json.dumps(json.loads(value), sort_keys=True, separators=(",", ":"))
    except (json.JSONDecodeError, TypeError):
        return re.sub(r"\s+", "", value)


async def _run_case(source: str, language: str, stdin: str = "") -> dict:
    if language not in _LANGUAGE_IDS:
        raise HTTPException(422, f"Unsupported language: {language}")
    settings = get_settings()
    headers = {"Content-Type": "application/json"}
    if settings.judge0_api_key:
        headers["X-RapidAPI-Key"] = settings.judge0_api_key
    if settings.judge0_api_host:
        headers["X-RapidAPI-Host"] = settings.judge0_api_host
    encoded_source = base64.b64encode(source.encode("utf-8")).decode("ascii")
    encoded_stdin = base64.b64encode(stdin.encode("utf-8")).decode("ascii")
    try:
        async with httpx.AsyncClient(timeout=25) as client:
            response = await client.post(
                f"{settings.judge0_api_url.rstrip('/')}/submissions",
                params={"base64_encoded": "true", "wait": "true"},
                headers=headers,
                json={
                    "language_id": _LANGUAGE_IDS[language],
                    "source_code": encoded_source,
                    "stdin": encoded_stdin,
                },
            )
            if response.is_error:
                error_body = response.text[:2000]
                _logger.error(
                    "Judge0 returned HTTP %s: %s",
                    response.status_code,
                    error_body,
                )
                raise HTTPException(
                    status_code=502,
                    detail=f"Judge0 returned HTTP {response.status_code}: {error_body}",
                )
            response.raise_for_status()
            result = response.json()
    except HTTPException:
        raise
    except (httpx.HTTPError, ValueError) as exc:
        raise HTTPException(503, f"Judge0 execution failed: {exc}") from exc
    for field in ("stdout", "stderr", "compile_output", "message"):
        encoded_value = result.get(field)
        if encoded_value:
            try:
                result[field] = base64.b64decode(encoded_value, validate=True).decode("utf-8", errors="replace")
            except (ValueError, UnicodeEncodeError) as exc:
                raise HTTPException(502, f"Judge0 returned invalid base64 in {field}.") from exc
    status_id = (result.get("status") or {}).get("id")
    if status_id in {1, 2}:
        raise HTTPException(503, "Judge0 did not complete execution synchronously; configure a wait-enabled endpoint.")
    return result


async def _judge(
    problem: dict, language: str, code: str, *, include_hidden: bool = False
) -> tuple[dict, int, float]:
    method, params = _method_signature(problem)
    examples = problem.get("examples", [])
    test_cases = list(examples)
    if include_hidden:
        test_cases.extend(problem.get("hiddenTests", []))
    if not test_cases:
        raise HTTPException(422, "Problem has no example test cases to execute.")

    cases = []
    total_runtime = 0
    max_memory = 0.0
    all_passed = True
    final_status = "Accepted"
    first_error: str | None = None
    for example in test_cases:
        try:
            bindings = _split_assignments(example["input"])
            args = [
                bindings["adjList"] if param == "node" and "adjList" in bindings else bindings[param]
                for param in params
            ]
            source = _build_source(problem, language, code, method, params, args)
        except (KeyError, ValueError, SyntaxError) as exc:
            raise HTTPException(422, f"Cannot build test harness for test case: {exc}") from exc
        result = await _run_case(source, language)
        stdout = (result.get("stdout") or "").strip()
        expected = example["output"]
        status_id = (result.get("status") or {}).get("id")
        passed = status_id == 3 and _normalized_output(stdout) == _normalized_output(expected)
        runtime = result.get("time")
        memory = result.get("memory")
        runtime_ms = round(float(runtime) * 1000) if runtime is not None else 0
        memory_mb = round(float(memory) / 1024, 1) if memory is not None else 0.0
        total_runtime += runtime_ms
        max_memory = max(max_memory, memory_mb)
        all_passed = all_passed and passed
        if not passed and final_status == "Accepted":
            final_status = {
                5: "Time Limit Exceeded",
                6: "Compile Error",
                7: "Runtime Error",
                8: "Runtime Error",
                9: "Runtime Error",
                10: "Runtime Error",
                11: "Runtime Error",
                12: "Internal Error",
            }.get(status_id, "Wrong Answer")
            first_error = (
                result.get("compile_output")
                or result.get("stderr")
                or (result.get("status") or {}).get("description")
            )
        cases.append(
            {
                "input": example["input"],
                "expected": expected,
                "output": stdout if stdout else (result.get("compile_output") or result.get("stderr") or ""),
                "passed": passed,
            }
        )
    return {
        "status": "Accepted" if all_passed else final_status,
        "runtimeMs": total_runtime,
        "memoryMb": max_memory,
        "cases": cases,
        "error": first_error,
    }, len(test_cases), max_memory


async def judge_run(problem: dict, language: str, code: str) -> dict:
    result, _, _ = await _judge(problem, language, code)
    return result


async def judge_submit(problem: dict, language: str, code: str) -> dict:
    result, total_count, _ = await _judge(
        problem, language, code, include_hidden=True
    )
    return {
        "status": result["status"],
        "runtimeMs": result["runtimeMs"],
        "memoryMb": result["memoryMb"],
        "passed": sum(
            1 for case in result["cases"] if case["passed"]
        ),
        "total": total_count,
        "language": language,
        "error": result["error"],
    }
