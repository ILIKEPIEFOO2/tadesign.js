String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

function TradeSign(buy, sell) {
    this.buying = item.of(buy);
    this.selling = item.of(sell);
    this.canTrade = function(player, inventory) {
        if (!this.selling || !this.buying) {
            player.tell("[TradeSigns] One or more items are invalid in this transaction");
            return false;
        }
        var returnItem = inventory.find(this.selling.ignoreNBT());
        if (returnItem != -1) {
            if (player.inventory.find(this.buying) != -1) {
                return true;
            } else {
                player.tell("[TradeSigns] You do not have the required items to make this trade!");
            }
        } else {
            player.tell("[TradeSigns] Chest is out of stock! Please check back later.");
        }
        return false;
    };
    this.trade = function(player, inventory) {
        if (this.canTrade(player, inventory)) {
            var maxStackSize = this.buying.item.getItemStackLimit(this.buying.itemStack);
            var hasFinished = false;
            var emptySpace = -1;
            var foundEmptySpot = false;
            for (var i = 0; i < inventory.size; i++) {
                if (inventory.get(i).id.toString() == this.buying.id.toString()) {
                    if (inventory.get(i).count <= maxStackSize - this.buying.count) {
                        inventory.get(i).count += this.buying.count;
                        player.inventory.get(player.inventory.find(this.buying)).count -= this.buying.count;
						var playerItem=inventory.get(inventory.find(this.selling.ignoreNBT())).getCopy();
						playerItem.count=this.selling.count;
						player.give(playerItem);
                        inventory.get(inventory.find(this.selling.ignoreNBT())).count -= this.selling.count;
                        hasFinished = true;
                        player.tell("[TradeSigns] You have successfully traded a " + this.buying.toString() + " for a " + this.selling.toString() + "!");
                        break;
                    }
                } else if (inventory.get(i).id.toString() == "minecraft:air" & !foundEmptySpot) {
                    emptySpace = i;
                    foundEmptySpot = true;
                }
            }
            if (!hasFinished) {
                if (foundEmptySpot) {
                    inventory.set(emptySpace, this.buying);
                    player.inventory.get(player.inventory.find(this.buying)).count -= this.buying.count;
                    var playerItem=inventory.get(inventory.find(this.selling.ignoreNBT())).getCopy();
					playerItem.count=this.selling.count;
					player.give(playerItem);
                    inventory.get(inventory.find(this.selling.ignoreNBT())).count -= this.selling.count;
                } else {
                    player.tell("[TradeSigns] Chest lacks the space to complete transaction.");
                }
            }
        }
    };
}

events.listen("block.right_click", function(event) {
    if (event.block.id.toString().equals("minecraft:oak_sign") || event.block.id.toString().equals("minecraft:oak_wall_sign") || event.block.id.toString().equals("minecraft:spruce_sign") || event.block.id.toString().equals("minecraft:spruce_wall_sign") || event.block.id.toString().equals("minecraft:birch_sign") || event.block.id.toString().equals("minecraft:birch_wall_sign") || event.block.id.toString().equals("minecraft:jungle_sign") || event.block.id.toString().equals("minecraft:jungle_wall_sign") || event.block.id.toString().equals("minecraft:acacia_sign") || event.block.id.toString().equals("minecraft:acacia_wall_sign") || event.block.id.toString().equals("minecraft:dark_oak_sign") || event.block.id.toString().equals("minecraft:dark_oak_wall_sign")) {
        var entData = event.block.entityData;
        if (entData.get("Text1").replace(/\\/g, "").replaceAll("\"", "").replaceAll("{", "}").replaceAll("}", "").replaceAll("text:", "").toLowerCase() == "[trade]") {
            var buying = entData.get("Text2").replace(/\\/g, "").replaceAll("\"", "").replaceAll("{", "}").replaceAll("}", "").replaceAll("text:", "");
            var selling = entData.get("Text3").replace(/\\/g, "").replaceAll("\"", "").replaceAll("{", "}").replaceAll("}", "").replaceAll("text:", "");
            if (item.of(buying).empty || item.of(selling).empty || item.of(selling) == "minecraft:air" || item.of(selling) == "minecraft:air") {
                event.player.tell("[TradeSigns] Invalid Trade Sign Syntax.");
            } else {
                var acceptableStorageTypes = [
                    "minecraft:chest",
                    "minecraft:trapped_chest",
                    "minecraft:dropper",
                    "minecraft:dispencer",
                    "minecraft:dropper",
                    "minecraft:shulker_box",
                    "minecraft:white_shulker_box",
                    "minecraft:orange_shulker_box",
                    "minecraft:magenta_shulker_box",
                    "minecraft:light_blue_shulker_box",
                    "minecraft:yellow_shulker_box",
                    "minecraft:lime_shulker_box",
                    "minecraft:pink_shulker_box",
                    "minecraft:gray_shulker_box",
                    "minecraft:light_gray_shulker_box",
                    "minecraft:cyan_shulker_box",
                    "minecraft:purple_shulker_box",
                    "minecraft:blue_shulker_box",
                    "minecraft:brown_shulker_box",
                    "minecraft:green_shulker_box",
                    "minecraft:red_shulker_box",
                    "minecraft:black_shulker_box"
                ];
                var blockID = event.block.id.toString();
                if (blockID.equals("minecraft:oak_sign") || blockID.equals("minecraft:spruce_sign") || blockID.equals("minecraft:birch_sign") || blockID.equals("minecraft:jungle_sign") || blockID.equals("minecraft:acacia_sign") || blockID.equals("minecraft:dark_oak_sign")) {
                    var chestBlock = event.world.getBlock(event.block.x, event.block.y - 1, event.block.z);
                } else if (blockID.equals("minecraft:oak_wall_sign") || blockID.equals("minecraft:spruce_wall_sign") || blockID.equals("minecraft:birch_wall_sign") || blockID.equals("minecraft:jungle_wall_sign") || blockID.equals("minecraft:acacia_wall_sign") || blockID.equals("minecraft:dark_oak_wall_sign")) {
                    for (var i = 0; i < acceptableStorageTypes.length; i++) {
                        if (event.block.north.id.toString() == acceptableStorageTypes[i]) {
                            var chestBlock = event.world.getBlock(event.block.x, event.block.y, event.block.z - 1);
                            break;
                        } else if (event.block.east.id.toString() == acceptableStorageTypes[i]) {
                            var chestBlock = event.world.getBlock(event.block.x + 1, event.block.y, event.block.z);
                            break;
                        } else if (event.block.south.id.toString() == acceptableStorageTypes[i]) {
                            var chestBlock = event.world.getBlock(event.block.x, event.block.y, event.block.z + 1);
                            break;
                        } else if (event.block.west.id.toString() == acceptableStorageTypes[i]) {
                            var chestBlock = event.world.getBlock(event.block.x - 1, event.block.y, event.block.z);
                            break;
                        }
                    }
                }
                if (chestBlock) {
                    var found = false;
                    for (var i = 0; i < acceptableStorageTypes.length; i++) {
                        if (chestBlock.id.toString() == acceptableStorageTypes[i]) {
                            var tradez = new TradeSign(buying, selling);
                            tradez.trade(event.player, chestBlock.getInventory(event.facing));
                            found = true;
                            break;
                        }
                    }
                    if (!found) {
                        event.player.tell("[TradeSigns] Trade Inventory could not be found.");
                    }
                } else {
                    event.player.tell("[TradeSigns] Trade Inventory could not be found.");
                }
            }
        }
    }
});
