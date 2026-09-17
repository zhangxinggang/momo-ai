import sys, json, importlib.util, inspect, asyncio, contextlib
protocol = sys.stdout

def write(frame):
    protocol.write(json.dumps(frame, ensure_ascii=False) + "\n")
    protocol.flush()

def call_tool(tool_id, value):
    write({"type":"call","id":"nested","toolId":tool_id,"input":value})
    response = json.loads(sys.stdin.readline(2 * 1024 * 1024))
    if "error" in response: raise RuntimeError(response["error"])
    return response.get("value")

try:
    request = json.loads(sys.stdin.readline(2 * 1024 * 1024))
    sys.path.insert(0, request["toolRoot"])
    with contextlib.redirect_stdout(sys.stderr):
        spec = importlib.util.spec_from_file_location("momo_action", request["entry"])
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        action = getattr(module, request.get("export", "execute"))
        value = action(request["input"], {"toolRoot":request["toolRoot"],"dataDir":request["dataDir"],"callTool":call_tool})
        if inspect.isawaitable(value): value = asyncio.run(value)
    write({"type":"result","value":value})
except Exception as error:
    write({"type":"error","message":str(error)})
