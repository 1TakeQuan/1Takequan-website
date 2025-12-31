// src/app/games/quan-runner/player.ts
export type Player = {
    lane: number;          // 0..LANE_COUNT-1
    y: number;             // world Y (top of player)
    velocityY: number;
    isJumping: boolean;
    jumpsRemaining: number;

    isSliding: boolean;
    slideUntil: number;
};

export type PlayerMetrics = {
    w: number;
    h: number;
    groundY: number;

    PLAYER_SIZE: number;
    PLAYER_W: number;
    PLAYER_H_STAND: number;
    PLAYER_H_SLIDE: number;

    MAX_JUMPS: number;
    SLIDE_MS: number;

    GRAVITY: number;
    JUMP_POWER: number;
};

export function createPlayer(m: PlayerMetrics, laneCount: number): Player {
    return {
        lane: Math.floor(laneCount / 2),
        y: m.groundY - (m.PLAYER_H_STAND), // top = ground - height
        velocityY: 0,
        isJumping: false,
        jumpsRemaining: m.MAX_JUMPS,
        isSliding: false,
        slideUntil: 0,
    };
}

export function startSlide(player: Player, m: PlayerMetrics) {
    // allow slide ANYTIME (even mid-air). Hitbox will shorten immediately.
    player.isSliding = true;
    player.slideUntil = Date.now() + m.SLIDE_MS;
}

export function switchLane(player: Player, dir: -1 | 1, laneCount: number) {
  // ✅ allow switching lanes mid-air AND while sliding
  player.lane = Math.max(0, Math.min(laneCount - 1, player.lane + dir));
}

export function jump(player: Player, m: PlayerMetrics) {
    if (player.jumpsRemaining <= 0) return;
    player.velocityY = m.JUMP_POWER;
    player.isJumping = true;
    player.jumpsRemaining--;
}

export function updatePlayer(player: Player, dt: number, m: PlayerMetrics) {
    // slide expiration
    if (player.isSliding && Date.now() > player.slideUntil) {
        player.isSliding = false;
    }

    // gravity + vertical motion
    if (player.isJumping) {
        player.velocityY += m.GRAVITY;
        player.y += player.velocityY;

        // landing line is ALWAYS the same groundY (lanes are horizontal, not vertical)
        const standH = player.isSliding ? m.PLAYER_H_SLIDE : m.PLAYER_H_STAND;
        const baseTop = m.groundY - standH;

        if (player.y >= baseTop) {
            player.y = baseTop;
            player.velocityY = 0;
            player.isJumping = false;
            player.jumpsRemaining = m.MAX_JUMPS;
        }
    } else {
        // keep grounded
        const standH = player.isSliding ? m.PLAYER_H_SLIDE : m.PLAYER_H_STAND;
        player.y = m.groundY - standH;
    }
}

export function getPlayerHitbox(player: Player, m: PlayerMetrics) {
    const h = player.isSliding ? m.PLAYER_H_SLIDE : m.PLAYER_H_STAND;
    return {
        top: player.y,
        bottom: player.y + h,
        height: h,
    };
}

export function drawPlayer(
    ctx: CanvasRenderingContext2D,
    opts: {
        m: PlayerMetrics;
        player: Player;
        laneCenterX: (lane: number, z: number) => number;
        logoImg?: HTMLImageElement | null;
    }
) {
    const { m, player, laneCenterX, logoImg } = opts;

    // player is near camera (z=0)
    const px = laneCenterX(player.lane, 0);

    // Convert world Y to screen-ish Y: your road near line is around (h - 60),
    // but we want the character to sit slightly above bottom for readability.
    // Use world y directly with a small offset:
    const py = player.y - (m.h - (m.groundY + 50)); // stabilizes with resize

    const scale = 1.15;
    const t = Date.now() * 0.01;
    const legAnim = Math.sin(t) * 10;

    const playerSize = m.PLAYER_SIZE;
    const torsoLen = player.isSliding ? 10 : 20;
    const legBaseY = playerSize + torsoLen;
    const legLen = 15;

    ctx.save();
    ctx.globalAlpha = 0.18;
    ctx.fillStyle = "#000";
    ctx.ellipse(
      px, // player X position
      m.groundY - 8, // just above the ground
      m.PLAYER_W * 0.45, // width of shadow
      m.PLAYER_W * 0.18, // height of shadow
      0, 0, Math.PI * 2
    );
    ctx.fill();
    ctx.restore();

    ctx.save();

    // Add a subtle shadow/glow
    ctx.shadowColor = "rgba(251,191,36,0.25)"; // soft gold glow
    ctx.shadowBlur = 18;

    ctx.translate(px - (playerSize * scale) / 2, py);
    ctx.scale(scale, scale);

    ctx.strokeStyle = "#ef4444";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";

    // torso
    ctx.beginPath();
    ctx.moveTo(playerSize / 2, playerSize);
    ctx.lineTo(playerSize / 2, legBaseY);
    ctx.stroke();

    // legs
    ctx.beginPath();
    ctx.moveTo(playerSize / 2, legBaseY);
    ctx.lineTo(playerSize / 2 - 8, legBaseY + legLen + legAnim);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(playerSize / 2, legBaseY);
    ctx.lineTo(playerSize / 2 + 8, legBaseY + legLen - legAnim);
    ctx.stroke();

    // arms
    ctx.beginPath();
    ctx.moveTo(playerSize / 2, playerSize + 5);
    ctx.lineTo(playerSize / 2 - 12, playerSize + 15 - legAnim);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(playerSize / 2, playerSize + 5);
    ctx.lineTo(playerSize / 2 + 12, playerSize + 15 + legAnim);
    ctx.stroke();

    // head
    const headY = player.isSliding ? 12 : 0;
    if (logoImg) ctx.drawImage(logoImg, 0, headY, playerSize, playerSize);
    else {
        ctx.fillStyle = "#ef4444";
        ctx.beginPath();
        ctx.arc(playerSize / 2, headY + playerSize / 2, playerSize / 2, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.restore();
}