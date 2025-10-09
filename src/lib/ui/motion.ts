import { env as pubenv } from '$env/dynamic/public';

const scaleRaw = Number(pubenv.PUBLIC_MOTION_SCALE ?? '1');
const scale = !Number.isNaN(scaleRaw) && scaleRaw > 0 ? scaleRaw : 1;

export const motion = {
  delayStep: 40 * scale,
  delayStepSm: 30 * scale,
  durationIn: 200 * scale,
  durationOut: 150 * scale,
  durationItemIn: 200 * scale,
  durationItemFade: 180 * scale,
  slideY: 16,
  slideItemY: 6,
  fromRightX: 64
};
