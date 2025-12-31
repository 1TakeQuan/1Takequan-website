export type RoadFns = {
    roadBoundsAtZ: (z: number) => { left: number; right: number; y: number; bottomY: number; topY: number };
    laneCenterX: (lane: number, z: number) => number;
    laneEdgeX: (edgeIndex: number, z: number) => number;
    zToY: (z: number) => number;
    zToScale: (z: number) => number;
    drawRoad3D: (
        ctx: CanvasRenderingContext2D,
        opts: { w: number; h: number; laneCount: number; playerLane: number; timeMs: number; speed: number }
    ) => void;
};

export function makeRoad(laneCount: number): RoadFns {
    function roadBoundsAtZ(z: number) {
        // Placeholder; actual values set in drawRoad3D
        return { left: 0, right: 0, y: 0, bottomY: 0, topY: 0 };
    }

    const api: RoadFns = {
        roadBoundsAtZ: (_z) => ({ left: 0, right: 0, y: 0, bottomY: 0, topY: 0 }),
        laneCenterX: (_lane, _z) => 0,
        laneEdgeX: (_edgeIndex, _z) => 0,
        zToY: (_z) => 0,
        zToScale: (_z) => 1,
        drawRoad3D(ctx, opts) {
            const { w, h, laneCount, playerLane, timeMs, speed } = opts;

            function _roadBoundsAtZ(z: number) {
                const bottomY = h - 60;
                const topY = 90;
                const bottomLeft = w * 0.12;
                const bottomRight = w * 0.88;
                const topLeft = w * 0.33;
                const topRight = w * 0.67;
                const left = topLeft + (bottomLeft - topLeft) * (1 - z);
                const right = topRight + (bottomRight - topRight) * (1 - z);
                const y = topY + (bottomY - topY) * (1 - z);
                return { left, right, y, bottomY, topY };
            }

            function _laneEdgeX(edgeIndex: number, z: number) {
                const { left, right } = _roadBoundsAtZ(z);
                const laneW = (right - left) / laneCount;
                return left + laneW * edgeIndex;
            }

            function _laneCenterX(lane: number, z: number) {
                const { left, right } = _roadBoundsAtZ(z);
                const laneW = (right - left) / laneCount;
                return left + laneW * (lane + 0.5);
            }

            function _zToY(z: number) {
                return _roadBoundsAtZ(z).y;
            }

            function _zToScale(z: number) {
                return 0.5 + (1 - z) * 1.2;
            }

            api.roadBoundsAtZ = _roadBoundsAtZ;
            api.laneEdgeX = _laneEdgeX;
            api.laneCenterX = _laneCenterX;
            api.zToY = _zToY;
            api.zToScale = _zToScale;

            const far = _roadBoundsAtZ(1);
            const near = _roadBoundsAtZ(0);

            ctx.save();
            ctx.beginPath();
            ctx.moveTo(far.left, far.y);
            ctx.lineTo(far.right, far.y);
            ctx.lineTo(near.right, near.y);
            ctx.lineTo(near.left, near.y);
            ctx.closePath();

            const roadGrad = ctx.createLinearGradient(0, far.y, 0, near.y);
            roadGrad.addColorStop(0, "#0b1220");
            roadGrad.addColorStop(1, "#05070c");
            ctx.fillStyle = roadGrad;
            ctx.fill();

            ctx.strokeStyle = "rgba(255,255,255,0.08)";
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.beginPath();
            const farL = _laneEdgeX(playerLane, 1);
            const farR = _laneEdgeX(playerLane + 1, 1);
            const nearL = _laneEdgeX(playerLane, 0);
            const nearR = _laneEdgeX(playerLane + 1, 0);
            ctx.moveTo(farL, far.y);
            ctx.lineTo(farR, far.y);
            ctx.lineTo(nearR, near.y);
            ctx.lineTo(nearL, near.y);
            ctx.closePath();

            const hlGrad = ctx.createLinearGradient(0, far.y, 0, near.y);
            hlGrad.addColorStop(0, "rgba(239,68,68,0.05)");
            hlGrad.addColorStop(1, "rgba(239,68,68,0.18)");
            ctx.fillStyle = hlGrad;
            ctx.fill();

            ctx.lineWidth = 2;
            for (let i = 1; i < laneCount; i++) {
                const xFar = _laneEdgeX(i, 1);
                const xNear = _laneEdgeX(i, 0);
                ctx.strokeStyle = "rgba(255,255,255,0.10)";
                ctx.setLineDash([10, 14]);
                ctx.beginPath();
                ctx.moveTo(xFar, far.y);
                ctx.lineTo(xNear, near.y);
                ctx.stroke();
            }
            ctx.setLineDash([]);

            for (let lane = 0; lane < laneCount; lane++) {
                for (let k = 0; k < 10; k++) {
                    const z = k / 10;
                    const t = timeMs * 0.001;
                    const moving = (t * (0.8 + speed * 0.12) + lane * 0.07) % 1;
                    const zz = 1 - ((z + moving) % 1);
                    const b = _roadBoundsAtZ(zz);
                    const x = _laneCenterX(lane, zz);
                    const scale = 0.25 + (1 - zz) * 1.2;
                    const dashH = 6 * scale;
                    const dashW = 2.2 * scale;
                    ctx.fillStyle = "rgba(255,255,255,0.10)";
                    ctx.fillRect(x - dashW / 2, b.y - dashH / 2, dashW, dashH);
                }
            }

            const fog = ctx.createLinearGradient(0, far.y, 0, near.y);
            fog.addColorStop(0, "rgba(0,0,0,0.55)");
            fog.addColorStop(0.35, "rgba(0,0,0,0.25)");
            fog.addColorStop(1, "rgba(0,0,0,0.00)");
            ctx.fillStyle = fog;
            ctx.fillRect(0, 0, w, h);

            ctx.restore();
        },
    };

    return api;
}