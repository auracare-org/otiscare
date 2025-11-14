/**
 * NEWS2 (National Early Warning Score 2) Calculator
 * Based on Royal College of Physicians guidelines
 * https://www.rcp.ac.uk/improving-care/resources/national-early-warning-score-news-2/
 */

export type OxygenScale = 'scale1' | 'scale2';

export type ConsciousnessLevel = 'alert' | 'cvpu';

export type NEWS2Parameters = {
	respiratoryRate: number;
	oxygenSaturation: number;
	oxygenScale: OxygenScale;
	supplementalOxygen: boolean;
	temperature: number;
	systolicBP: number;
	heartRate: number;
	consciousness: ConsciousnessLevel;
};

export type NEWS2Result = {
	totalScore: number;
	breakdown: {
		respiratoryRate: number;
		oxygenSaturation: number;
		supplementalOxygen: number;
		temperature: number;
		systolicBP: number;
		heartRate: number;
		consciousness: number;
	};
	clinicalRisk: 'low' | 'medium' | 'high';
	clinicalResponse: string;
};

/**
 * Score respiratory rate (breaths per minute)
 */
export function scoreRespiratoryRate(rate: number): number {
	if (rate <= 8) return 3;
	if (rate <= 11) return 1;
	if (rate <= 20) return 0;
	if (rate <= 24) return 2;
	return 3; // ≥25
}

/**
 * Score oxygen saturation based on scale
 * Scale 1: Standard patients
 * Scale 2: Patients with hypercapnic respiratory failure
 */
export function scoreOxygenSaturation(
	saturation: number,
	scale: OxygenScale,
	supplementalO2: boolean
): number {
	if (scale === 'scale1') {
		// Standard scale
		if (saturation <= 91) return 3;
		if (saturation <= 93) return 2;
		if (saturation <= 95) return 1;
		return 0; // ≥96
	} else {
		// Scale 2: Hypercapnic respiratory failure
		if (saturation <= 83) return 3;
		if (saturation <= 85) return 2;
		if (saturation <= 87) return 1;
		if (saturation <= 92) return 0;

		// For ≥93%, scoring depends on supplemental oxygen
		if (!supplementalO2 && saturation >= 93) return 0;
		if (supplementalO2 && saturation <= 94) return 1;
		if (supplementalO2 && saturation <= 96) return 2;
		if (supplementalO2 && saturation >= 97) return 3;

		return 0;
	}
}

/**
 * Score supplemental oxygen usage
 */
export function scoreSupplementalOxygen(supplementalO2: boolean): number {
	return supplementalO2 ? 2 : 0;
}

/**
 * Score temperature (°C)
 */
export function scoreTemperature(temp: number): number {
	if (temp <= 35.0) return 3;
	if (temp <= 36.0) return 1;
	if (temp <= 38.0) return 0;
	if (temp <= 39.0) return 1;
	return 2; // ≥39.1
}

/**
 * Score systolic blood pressure (mmHg)
 */
export function scoreSystolicBP(bp: number): number {
	if (bp <= 90) return 3;
	if (bp <= 100) return 2;
	if (bp <= 110) return 1;
	if (bp <= 219) return 0;
	return 3; // ≥220
}

/**
 * Score heart rate (beats per minute)
 */
export function scoreHeartRate(rate: number): number {
	if (rate <= 40) return 3;
	if (rate <= 50) return 1;
	if (rate <= 90) return 0;
	if (rate <= 110) return 1;
	if (rate <= 130) return 2;
	return 3; // ≥131
}

/**
 * Score consciousness level
 * Alert = 0, CVPU (Confusion, Voice, Pain, Unresponsive) = 3
 */
export function scoreConsciousness(level: ConsciousnessLevel): number {
	return level === 'alert' ? 0 : 3;
}

/**
 * Calculate complete NEWS2 score
 */
export function calculateNEWS2(params: NEWS2Parameters): NEWS2Result {
	const breakdown = {
		respiratoryRate: scoreRespiratoryRate(params.respiratoryRate),
		oxygenSaturation: scoreOxygenSaturation(
			params.oxygenSaturation,
			params.oxygenScale,
			params.supplementalOxygen
		),
		supplementalOxygen: scoreSupplementalOxygen(params.supplementalOxygen),
		temperature: scoreTemperature(params.temperature),
		systolicBP: scoreSystolicBP(params.systolicBP),
		heartRate: scoreHeartRate(params.heartRate),
		consciousness: scoreConsciousness(params.consciousness)
	};

	const totalScore = Object.values(breakdown).reduce((sum, score) => sum + score, 0);

	// Determine clinical risk and response
	let clinicalRisk: 'low' | 'medium' | 'high';
	let clinicalResponse: string;

	if (totalScore === 0) {
		clinicalRisk = 'low';
		clinicalResponse = 'Continue routine monitoring';
	} else if (totalScore <= 4) {
		clinicalRisk = 'low';
		clinicalResponse = 'Monitor frequency should be at least 12 hourly';
	} else if (totalScore <= 6) {
		clinicalRisk = 'medium';
		clinicalResponse =
			'Urgent review by clinician with competencies in acute illness assessment. Consider escalation to critical care team';
	} else {
		clinicalRisk = 'high';
		clinicalResponse =
			'Emergency assessment by clinical team with critical care competencies. Usually transfer to higher level of care';
	}

	// Additional red flag: any single parameter scoring 3
	const hasRedFlag = Object.values(breakdown).some((score) => score === 3);
	if (hasRedFlag && totalScore < 7) {
		clinicalRisk = 'medium';
		if (totalScore <= 4) {
			clinicalResponse =
				'Urgent review by clinician (any parameter scoring 3 triggers urgent response even with low total score)';
		}
	}

	return {
		totalScore,
		breakdown,
		clinicalRisk,
		clinicalResponse
	};
}

/**
 * Get color class for risk level (Tailwind)
 */
export function getRiskColorClass(risk: 'low' | 'medium' | 'high'): string {
	switch (risk) {
		case 'low':
			return 'bg-success-50 text-success-700 border-success-200';
		case 'medium':
			return 'bg-amber-50 text-amber-700 border-amber-200';
		case 'high':
			return 'bg-red-50 text-red-700 border-red-200';
	}
}
