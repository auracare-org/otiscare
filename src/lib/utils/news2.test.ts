import { describe, it, expect } from 'vitest';
import {
	scoreRespiratoryRate,
	scoreOxygenSaturation,
	scoreSupplementalOxygen,
	scoreTemperature,
	scoreSystolicBP,
	scoreHeartRate,
	scoreConsciousness,
	calculateNEWS2,
	type NEWS2Parameters
} from './news2';

describe('NEWS2 Calculator', () => {
	describe('scoreRespiratoryRate', () => {
		it('should score ≤8 as 3 points', () => {
			expect(scoreRespiratoryRate(5)).toBe(3);
			expect(scoreRespiratoryRate(8)).toBe(3);
		});

		it('should score 9-11 as 1 point', () => {
			expect(scoreRespiratoryRate(9)).toBe(1);
			expect(scoreRespiratoryRate(10)).toBe(1);
			expect(scoreRespiratoryRate(11)).toBe(1);
		});

		it('should score 12-20 as 0 points', () => {
			expect(scoreRespiratoryRate(12)).toBe(0);
			expect(scoreRespiratoryRate(16)).toBe(0);
			expect(scoreRespiratoryRate(20)).toBe(0);
		});

		it('should score 21-24 as 2 points', () => {
			expect(scoreRespiratoryRate(21)).toBe(2);
			expect(scoreRespiratoryRate(24)).toBe(2);
		});

		it('should score ≥25 as 3 points', () => {
			expect(scoreRespiratoryRate(25)).toBe(3);
			expect(scoreRespiratoryRate(30)).toBe(3);
		});
	});

	describe('scoreOxygenSaturation', () => {
		describe('Scale 1 (Standard)', () => {
			it('should score ≤91% as 3 points', () => {
				expect(scoreOxygenSaturation(88, 'scale1', false)).toBe(3);
				expect(scoreOxygenSaturation(91, 'scale1', false)).toBe(3);
			});

			it('should score 92-93% as 2 points', () => {
				expect(scoreOxygenSaturation(92, 'scale1', false)).toBe(2);
				expect(scoreOxygenSaturation(93, 'scale1', false)).toBe(2);
			});

			it('should score 94-95% as 1 point', () => {
				expect(scoreOxygenSaturation(94, 'scale1', false)).toBe(1);
				expect(scoreOxygenSaturation(95, 'scale1', false)).toBe(1);
			});

			it('should score ≥96% as 0 points', () => {
				expect(scoreOxygenSaturation(96, 'scale1', false)).toBe(0);
				expect(scoreOxygenSaturation(100, 'scale1', false)).toBe(0);
			});
		});

		describe('Scale 2 (Hypercapnic)', () => {
			it('should score ≤83% as 3 points', () => {
				expect(scoreOxygenSaturation(80, 'scale2', false)).toBe(3);
				expect(scoreOxygenSaturation(83, 'scale2', false)).toBe(3);
			});

			it('should score 84-85% as 2 points', () => {
				expect(scoreOxygenSaturation(84, 'scale2', false)).toBe(2);
				expect(scoreOxygenSaturation(85, 'scale2', false)).toBe(2);
			});

			it('should score 86-87% as 1 point', () => {
				expect(scoreOxygenSaturation(86, 'scale2', false)).toBe(1);
				expect(scoreOxygenSaturation(87, 'scale2', false)).toBe(1);
			});

			it('should score 88-92% as 0 points', () => {
				expect(scoreOxygenSaturation(88, 'scale2', false)).toBe(0);
				expect(scoreOxygenSaturation(92, 'scale2', false)).toBe(0);
			});

			it('should score ≥93% on room air as 0 points', () => {
				expect(scoreOxygenSaturation(93, 'scale2', false)).toBe(0);
				expect(scoreOxygenSaturation(98, 'scale2', false)).toBe(0);
			});

			it('should score 93-94% on supplemental O2 as 1 point', () => {
				expect(scoreOxygenSaturation(93, 'scale2', true)).toBe(1);
				expect(scoreOxygenSaturation(94, 'scale2', true)).toBe(1);
			});

			it('should score 95-96% on supplemental O2 as 2 points', () => {
				expect(scoreOxygenSaturation(95, 'scale2', true)).toBe(2);
				expect(scoreOxygenSaturation(96, 'scale2', true)).toBe(2);
			});

			it('should score ≥97% on supplemental O2 as 3 points', () => {
				expect(scoreOxygenSaturation(97, 'scale2', true)).toBe(3);
				expect(scoreOxygenSaturation(100, 'scale2', true)).toBe(3);
			});
		});
	});

	describe('scoreSupplementalOxygen', () => {
		it('should score 2 points when on supplemental oxygen', () => {
			expect(scoreSupplementalOxygen(true)).toBe(2);
		});

		it('should score 0 points when on room air', () => {
			expect(scoreSupplementalOxygen(false)).toBe(0);
		});
	});

	describe('scoreTemperature', () => {
		it('should score ≤35.0°C as 3 points', () => {
			expect(scoreTemperature(34.5)).toBe(3);
			expect(scoreTemperature(35.0)).toBe(3);
		});

		it('should score 35.1-36.0°C as 1 point', () => {
			expect(scoreTemperature(35.5)).toBe(1);
			expect(scoreTemperature(36.0)).toBe(1);
		});

		it('should score 36.1-38.0°C as 0 points', () => {
			expect(scoreTemperature(36.5)).toBe(0);
			expect(scoreTemperature(37.0)).toBe(0);
			expect(scoreTemperature(38.0)).toBe(0);
		});

		it('should score 38.1-39.0°C as 1 point', () => {
			expect(scoreTemperature(38.5)).toBe(1);
			expect(scoreTemperature(39.0)).toBe(1);
		});

		it('should score ≥39.1°C as 2 points', () => {
			expect(scoreTemperature(39.5)).toBe(2);
			expect(scoreTemperature(40.0)).toBe(2);
		});
	});

	describe('scoreSystolicBP', () => {
		it('should score ≤90 mmHg as 3 points', () => {
			expect(scoreSystolicBP(85)).toBe(3);
			expect(scoreSystolicBP(90)).toBe(3);
		});

		it('should score 91-100 mmHg as 2 points', () => {
			expect(scoreSystolicBP(91)).toBe(2);
			expect(scoreSystolicBP(100)).toBe(2);
		});

		it('should score 101-110 mmHg as 1 point', () => {
			expect(scoreSystolicBP(101)).toBe(1);
			expect(scoreSystolicBP(110)).toBe(1);
		});

		it('should score 111-219 mmHg as 0 points', () => {
			expect(scoreSystolicBP(111)).toBe(0);
			expect(scoreSystolicBP(120)).toBe(0);
			expect(scoreSystolicBP(219)).toBe(0);
		});

		it('should score ≥220 mmHg as 3 points', () => {
			expect(scoreSystolicBP(220)).toBe(3);
			expect(scoreSystolicBP(250)).toBe(3);
		});
	});

	describe('scoreHeartRate', () => {
		it('should score ≤40 bpm as 3 points', () => {
			expect(scoreHeartRate(35)).toBe(3);
			expect(scoreHeartRate(40)).toBe(3);
		});

		it('should score 41-50 bpm as 1 point', () => {
			expect(scoreHeartRate(41)).toBe(1);
			expect(scoreHeartRate(50)).toBe(1);
		});

		it('should score 51-90 bpm as 0 points', () => {
			expect(scoreHeartRate(51)).toBe(0);
			expect(scoreHeartRate(75)).toBe(0);
			expect(scoreHeartRate(90)).toBe(0);
		});

		it('should score 91-110 bpm as 1 point', () => {
			expect(scoreHeartRate(91)).toBe(1);
			expect(scoreHeartRate(110)).toBe(1);
		});

		it('should score 111-130 bpm as 2 points', () => {
			expect(scoreHeartRate(111)).toBe(2);
			expect(scoreHeartRate(130)).toBe(2);
		});

		it('should score ≥131 bpm as 3 points', () => {
			expect(scoreHeartRate(131)).toBe(3);
			expect(scoreHeartRate(150)).toBe(3);
		});
	});

	describe('scoreConsciousness', () => {
		it('should score alert as 0 points', () => {
			expect(scoreConsciousness('alert')).toBe(0);
		});

		it('should score CVPU as 3 points', () => {
			expect(scoreConsciousness('cvpu')).toBe(3);
		});
	});

	describe('calculateNEWS2', () => {
		it('should calculate a normal patient as low risk (score 0)', () => {
			const params: NEWS2Parameters = {
				respiratoryRate: 16,
				oxygenSaturation: 98,
				oxygenScale: 'scale1',
				supplementalOxygen: false,
				temperature: 37.0,
				systolicBP: 120,
				heartRate: 75,
				consciousness: 'alert'
			};

			const result = calculateNEWS2(params);
			expect(result.totalScore).toBe(0);
			expect(result.clinicalRisk).toBe('low');
		});

		it('should calculate a moderately unwell patient as medium risk', () => {
			const params: NEWS2Parameters = {
				respiratoryRate: 23, // 2 points
				oxygenSaturation: 94, // 1 point
				oxygenScale: 'scale1',
				supplementalOxygen: false,
				temperature: 38.5, // 1 point
				systolicBP: 108, // 1 point
				heartRate: 95, // 1 point
				consciousness: 'alert'
			};

			const result = calculateNEWS2(params);
			expect(result.totalScore).toBe(6);
			expect(result.clinicalRisk).toBe('medium');
		});

		it('should calculate a critically unwell patient as high risk', () => {
			const params: NEWS2Parameters = {
				respiratoryRate: 28, // 3 points
				oxygenSaturation: 89, // 3 points
				oxygenScale: 'scale1',
				supplementalOxygen: true, // 2 points
				temperature: 35.0, // 3 points
				systolicBP: 85, // 3 points
				heartRate: 135, // 3 points
				consciousness: 'cvpu' // 3 points
			};

			const result = calculateNEWS2(params);
			expect(result.totalScore).toBe(20);
			expect(result.clinicalRisk).toBe('high');
		});

		it('should flag red flag even with low total score (any parameter = 3)', () => {
			const params: NEWS2Parameters = {
				respiratoryRate: 7, // 3 points (RED FLAG)
				oxygenSaturation: 98,
				oxygenScale: 'scale1',
				supplementalOxygen: false,
				temperature: 37.0,
				systolicBP: 120,
				heartRate: 75,
				consciousness: 'alert'
			};

			const result = calculateNEWS2(params);
			expect(result.totalScore).toBe(3);
			expect(result.clinicalRisk).toBe('low');
			expect(result.breakdown.respiratoryRate).toBe(3);
		});

		it('should handle Scale 2 (hypercapnic) oxygen scoring correctly', () => {
			const params: NEWS2Parameters = {
				respiratoryRate: 16,
				oxygenSaturation: 95, // 2 points on Scale 2 with O2
				oxygenScale: 'scale2',
				supplementalOxygen: true, // 2 points
				temperature: 37.0,
				systolicBP: 120,
				heartRate: 75,
				consciousness: 'alert'
			};

			const result = calculateNEWS2(params);
			expect(result.breakdown.oxygenSaturation).toBe(2);
			expect(result.breakdown.supplementalOxygen).toBe(2);
			expect(result.totalScore).toBe(4);
		});
	});
});
