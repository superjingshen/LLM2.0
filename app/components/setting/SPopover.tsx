import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

export default function SPopover() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Bot ID</Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="flex flex-col gap-3">
          <div>
            <h4 className="font-medium mb-1">如何获取Bot ID</h4>
            <p className="break-words text-sm text-gray-600">
              进入机器人的开发页面，开发页面URL中bot参数后面的数字即为bot ID。例如：
              https://www.coze.cn/space/341****/bot/73428668*****，其中bot_id为
              73428668*****。
            </p>
          </div>
          
          <div>
            <h4 className="font-medium mb-1">在其他项目中使用</h4>
            <p className="text-sm text-gray-600">
              1. 确保机器人已发布为API服务
            </p>
            <p className="text-sm text-gray-600">
              2. 选择认证方式：
              - 个人认证：需要Personal Access Token和Bot ID
              - OAuth认证：需要Client ID和Bot ID
            </p>
            <p className="text-sm text-gray-600">
              3. 使用API调用格式：
              POST https://api.coze.cn/v3/chat
            </p>
          </div>

          <div>
            <p className="text-sm">
              详细配置说明请参考{" "}
              <a
                target="_blank"
                rel="noreferrer"
                className="text-blue-500"
                href="https://www.coze.cn/docs/developer_guides/preparation"
              >
                开发指南
              </a>
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
