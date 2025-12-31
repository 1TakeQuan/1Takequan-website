import type { PlayerMetrics } from "./player";
import { getPlayerHitbox, type Player } from "./player";

export type Obstacle = {
    lane: number;
    z: number; // 1 far -> 0 near
    type: "block" | "spike";
    width: number;  // px at near scale
    height: number; // px at near scale
};

export type Coin = {
    lane: number;
    z: number;
    collected: boolean;
    anim?: number;
};

export function spawnObstacle(obstacles: Obstacle[], laneCount: number) {
    const lane = Math.floor(Math.random() * laneCount);
    const type = Math.random() < 0.5 ? "block" : "spike";
    obstacles.push({
        lane,
        z: 1,
        type,
        width: 44,
        height: type === "block" ? 46 : 48,
    });
}

export function spawnCoin(coins: Coin[], laneCount: number) {
    const lane = Math.floor(Math.random() * laneCount);
    coins.push({ lane, z: 1, collected: false, anim: 0 });
}

export function stepDepth(obstacles: Obstacle[], coins: Coin[], speed: number) {
    const SPEED_Z = 0.012 + speed * 0.0015;
    for (const o of obstacles) o.z -= SPEED_Z;
    for (const c of coins) c.z -= SPEED_Z;

    // keep only visible
    for (let i = obstacles.length - 1; i >= 0; i--) if (obstacles[i].z <= 0) obstacles.splice(i, 1);
    for (let i = coins.length - 1; i >= 0; i--) if (coins[i].z <= 0) coins.splice(i, 1);
}

export function checkCollisions(opts: {
    player: Player;
    m: PlayerMetrics;
    obstacles: Obstacle[];
    coins: Coin[];
    hitZ?: number;
    coinZ?: number;
    onHit: () => void;
    onCoin: (coin: Coin) => void;
}) {
    const { player, m, obstacles, coins, onHit, onCoin } = opts;
    const HIT_Z = opts.hitZ ?? 0.075;
    const COIN_Z = opts.coinZ ?? 0.085;

    const hb = getPlayerHitbox(player, m);

    // Obstacles: collide when in same lane and near camera
    for (let i = obstacles.length - 1; i >= 0; i--) {
        const obs = obstacles[i];
        if (obs.lane !== player.lane) continue;
        if (obs.z > HIT_Z) continue;

        // obstacle top in world space (ground aligned)
        const obsTop = m.groundY - obs.height;

        // If player's bottom is above obstacle top, you cleared it.
        // (Small margin prevents “ghost hits”.)
        const cleared = hb.bottom < obsTop + 6;

        if (cleared) {
            obstacles.splice(i, 1); // passed it
            continue;
        }

        // Otherwise you got hit
        onHit();
        obstacles.splice(i, 1);
    }

    // Coins
    for (let i = coins.length - 1; i >= 0; i--) {
        const coin = coins[i];
        if (coin.collected) { coins.splice(i, 1); continue; }
        if (coin.lane !== player.lane) continue;
        if (coin.z > COIN_Z) continue;

        onCoin(coin);
        coins.splice(i, 1);
    }
}

export function drawObstacles(opts: {
    ctx: CanvasRenderingContext2D;
    obstacles: Obstacle[];
    laneCenterX: (lane: number, z: number) => number;
    zToY: (z: number) => number;
    zToScale: (z: number) => number;
}) {
    const { ctx, obstacles, laneCenterX, zToY, zToScale } = opts;

    for (const obs of obstacles) {
        const x = laneCenterX(obs.lane, obs.z);
        const y = zToY(obs.z);
        const scale = zToScale(obs.z);

        const alpha = Math.min(1, Math.max(0.15, (1 - obs.z) * 1.25));

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(x, y);
        ctx.scale(scale, scale);

        if (obs.type === "block") {
            ctx.fillStyle = "#22c55e";
            ctx.strokeStyle = "#166534";
            ctx.lineWidth = 2;

            ctx.beginPath();
            ctx.moveTo(-22, -46);
            ctx.lineTo(22, -46);
            ctx.lineTo(22, 0);
            ctx.lineTo(-22, 0);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = "#4ade80";
            ctx.beginPath();
            ctx.moveTo(-22, -46);
            ctx.lineTo(0, -56);
            ctx.lineTo(22, -46);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = "#16a34a";
            ctx.beginPath();
            ctx.moveTo(22, -46);
            ctx.lineTo(0, -56);
            ctx.lineTo(0, 0);
            ctx.lineTo(22, 0);
            ctx.closePath();
            ctx.fill();
        } else {
            ctx.fillStyle = "#dc2626";
            ctx.beginPath();
            ctx.moveTo(-22, 0);
            ctx.lineTo(0, -48);
            ctx.lineTo(22, 0);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = "rgba(0,0,0,0.18)";
            ctx.beginPath();
            ctx.moveTo(-22, 0);
            ctx.lineTo(0, 10);
            ctx.lineTo(22, 0);
            ctx.closePath();
            ctx.fill();
        }

        ctx.restore();
    }
}

export function drawCoins(opts: {
    ctx: CanvasRenderingContext2D;
    coins: Coin[];
    laneCenterX: (lane: number, z: number) => number;
    zToY: (z: number) => number;
    zToScale: (z: number) => number;
}) {
    const { ctx, coins, laneCenterX, zToY, zToScale } = opts;

    for (const coin of coins) {
        let scale = zToScale(coin.z);
        let alpha = 1;
        const anim = coin.anim ?? 0;
        if (anim > 0) {
            scale *= 1 + anim * 0.7;
            alpha = anim;
        }
        if (coin.collected && anim <= 0) continue;

        const x = laneCenterX(coin.lane, coin.z);
        const y = zToY(coin.z) - 30 * zToScale(coin.z);

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(x, y);
        ctx.scale(scale, scale);

        ctx.fillStyle = "#fbbf24";
        ctx.beginPath();
        ctx.arc(0, 0, 12, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "#f59e0b";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = "#000";
        ctx.font = "bold 16px Arial";
        ctx.textAlign = "center";
        ctx.fillText("$", 0, 6);

        ctx.restore();
    }
}
