import { dialogueData, scaleFactor } from "./constants";
import { kaboomContext } from "./kaboomCtx";
import { displayDialogue, setCamScale } from "./utils";

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

kaboomContext.scene("main", async () => {
  const mapData = await (await fetch("./map.json")).json();
  const layers = mapData.layers;

  const map = kaboomContext.add([
    kaboomContext.sprite("map"),
    kaboomContext.pos(0),
    kaboomContext.scale(scaleFactor),
  ]);

  const player = kaboomContext.make([
    kaboomContext.sprite("spritesheet", { anim: "idle-down" }),
    kaboomContext.area({
      shape: new kaboomContext.Rect(kaboomContext.vec2(0, 3), 10, 10),
    }),
    kaboomContext.body(),
    kaboomContext.anchor("center"),
    kaboomContext.pos(),
    kaboomContext.scale(scaleFactor),
    {
      speed: 250,
      direction: "down",
      isInDialogue: false,
    },
    "player",
  ]);

  for (const layer of layers) {
    if (layer.name === "boundaries") {
      for (const boundary of layer.objects) {
        map.add([
          kaboomContext.area({
            shape: new kaboomContext.Rect(
              kaboomContext.vec2(0),
              boundary.width,
              boundary.height
            ),
          }),
          kaboomContext.body({ isStatic: true }),
          kaboomContext.pos(boundary.x, boundary.y),
          boundary.name,
        ]);

        if (boundary.name) {
          player.onCollide(boundary.name, () => {
            player.isInDialogue = true;
            displayDialogue(
              dialogueData[boundary.name],
              () => (player.isInDialogue = false)
            );
          });
        }
      }

      continue;
    }

    if (layer.name === "spawnpoints") {
      for (const entity of layer.objects) {
        if (entity.name === "player") {
          player.pos = kaboomContext.vec2(
            (map.pos.x + entity.x) * scaleFactor,
            (map.pos.y + entity.y) * scaleFactor
          );
          kaboomContext.add(player);
          continue;
        }
      }
    }
  }

  setCamScale(kaboomContext);

  kaboomContext.onResize(() => {
    setCamScale(kaboomContext);
  });

  kaboomContext.onUpdate(() => {
    kaboomContext.camPos(player.worldPos().x, player.worldPos().y - 100);
  });

  kaboomContext.onMouseDown((mouseBtn) => {
    if (mouseBtn !== "left" || player.isInDialogue) return;

    const worldMousePos = kaboomContext.toWorld(kaboomContext.mousePos());
    player.moveTo(worldMousePos, player.speed);

    const mouseAngle = player.pos.angle(worldMousePos);

    const lowerBound = 50;
    const upperBound = 125;

    if (
      mouseAngle > lowerBound &&
      mouseAngle < upperBound &&
      player.curAnim() !== "walk-up"
    ) {
      player.play("walk-up");
      player.direction = "up";
      return;
    }

    if (
      mouseAngle < -lowerBound &&
      mouseAngle > -upperBound &&
      player.curAnim() !== "walk-down"
    ) {
      player.play("walk-down");
      player.direction = "down";
      return;
    }

    if (Math.abs(mouseAngle) > upperBound) {
      player.flipX = false;
      if (player.curAnim() !== "walk-side") player.play("walk-side");
      player.direction = "right";
      return;
    }

    if (Math.abs(mouseAngle) < lowerBound) {
      player.flipX = true;
      if (player.curAnim() !== "walk-side") player.play("walk-side");
      player.direction = "left";
      return;
    }
  });

  function stopAnims() {
    if (player.direction === "down") {
      player.play("idle-down");
      return;
    } else if (player.direction === "up") {
      player.play("idle-up");
      return;
    }

    player.play("idle-side");
  }

  kaboomContext.onMouseRelease(stopAnims);

  kaboomContext.onKeyRelease(() => {
    stopAnims();
  });

  kaboomContext.onKeyDown((key) => {
    const keyMap = [
      kaboomContext.isKeyDown("right"),
      kaboomContext.isKeyDown("left"),
      kaboomContext.isKeyDown("up"),
      kaboomContext.isKeyDown("down"),
    ];

    let nbOfKeyPressed = 0;
    for (const key of keyMap) {
      if (key) {
        nbOfKeyPressed++;
      }
    }

    if (nbOfKeyPressed > 1) return;

    if (player.isInDialogue) return;
    if (keyMap[0]) {
      player.flipX = false;
      if (player.curAnim() !== "walk-side") player.play("walk-side");
      player.direction = "right";
      player.move(player.speed, 0);
      return;
    }

    if (keyMap[1]) {
      player.flipX = true;
      if (player.curAnim() !== "walk-side") player.play("walk-side");
      player.direction = "left";
      player.move(-player.speed, 0);
      return;
    }

    if (keyMap[2]) {
      if (player.curAnim() !== "walk-up") player.play("walk-up");
      player.direction = "up";
      player.move(0, -player.speed);
      return;
    }

    if (keyMap[3]) {
      if (player.curAnim() !== "walk-down") player.play("walk-down");
      player.direction = "down";
      player.move(0, player.speed);
    }
  });
});

kaboomContext.go("main");
