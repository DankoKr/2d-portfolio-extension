import { kaboomContext } from "./kaboomCtx";
import { scaleFactor } from "./constants";

kaboomContext.loadSprite("spritesheet", "./spritesheet.png", {
  sliceX: 39,
  sliceY: 31,
  anims: {
    "idle-down": 936,
    "walk-down": { from: 936, to: 939, loop: true, speed: 8 },
    "idle-side": 975,
    "walk-side": { from: 975, to: 978, loop: true, speed: 8 },
    "idle-up": 1014,
    "walk-up": { from: 1014, to: 1017, loop: true, speed: 8 },
  },
});

kaboomContext.loadSprite("map", "./map.png");

kaboomContext.setBackground(kaboomContext.Color.fromHex("#311047"));

kaboomContext.scene("main", async ()=>{
  const mapData = await (await fetch("./map.json")).json();
  const layers = mapData.layers;

  const map = kaboomContext.make([kaboomContext.sprite("map"), kaboomContext.pos(0), kaboomContext.scale(scaleFactor)]);
});

kaboomContext.go("main");