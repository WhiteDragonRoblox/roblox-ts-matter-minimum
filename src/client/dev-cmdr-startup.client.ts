// 自动读取 .env 配置, 无需 dotenv.

// 客户端启动时, 调用 cmdr 进行测试

import { $env,$NODE_ENV } from "rbxts-transform-env";

import { Cmdr, CmdrClient } from "@rbxts/cmdr";

if($NODE_ENV==="dev"){
    const command = $env.string("START_UP_COMMAND")
    if(command!==undefined){
        warn("run cmdr test",command)
        CmdrClient.Dispatcher.Run(command);
    }

}
