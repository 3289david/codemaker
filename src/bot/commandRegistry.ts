import type { BotCommand } from "@/bot/types";
import { orderListCommand, orderDetailCommand } from "@/bot/commands/orders";
import { noticeCreateCommand } from "@/bot/commands/notice";

export const commands: BotCommand[] = [orderListCommand, orderDetailCommand, noticeCreateCommand];

export const commandsByName = new Map(commands.map((c) => [c.data.name, c]));
