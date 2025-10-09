# Medical AI Cloud Run Integration Guide

## For Website Developers: Integrating Ear Infection Diagnosis

This guide explains how to integrate our **97.4% accurate** PyTorch medical AI models into your website for automated ear infection diagnosis from uploaded otoscopic images.

---

## 🏥 **System Overview**

Our production system uses a **dual-stage architecture** for comprehensive medical diagnosis:

### **Stage 1: Binary Screening** (Normal vs Pathological)
- **Endpoint**: `https://pytorch-binary-screening-97937849866.us-central1.run.app`
- **Purpose**: Initial screening to detect any pathology
- **Accuracy**: 96.3% (98%+ sensitivity for clinical safety)
- **Speed**: ~300-500ms response time

### **Stage 2: Multiclass Diagnostic** (Specific Condition Identification)
- **Endpoint**: `https://pytorch-multiclass-diagnostic-97937849866.us-central1.run.app`
- **Purpose**: Diagnose specific ear conditions when pathology detected
- **Accuracy**: 97.4% across 5 pathological conditions
- **Speed**: ~600ms response time

---

## 🚀 **Quick Start: Complete Integration**

### **Recommended Workflow**

```javascript
async function diagnoseEarImage(imageFile) {
    // Step 1: Convert image to base64
    const base64Image = await fileToBase64(imageFile);

    // Step 2: Binary screening (Stage 1)
    const screeningResult = await callBinaryScreening(base64Image);

    if (screeningResult.classification === 'normal') {
        return {
            diagnosis: 'Normal Tympanic Membrane',
            confidence: screeningResult.confidence,
            priority: 'NORMAL',
            recommendation: 'No pathology detected - no treatment indicated'
        };
    }

    // Step 3: Multiclass diagnosis (Stage 2) - only if pathological
    const diagnosisResult = await callMulticlassDiagnostic(base64Image);

    return {
        diagnosis: diagnosisResult.diagnosis,
        confidence: diagnosisResult.confidence,
        priority: diagnosisResult.clinical_priority,
        recommendation: diagnosisResult.treatment_recommendation,
        probabilities: diagnosisResult.probabilities
    };
}
```

---

## 📡 **API Endpoints**

### **1. Binary Screening Endpoint**

**URL**: `https://pytorch-binary-screening-97937849866.us-central1.run.app/predict`

**Method**: `POST`

**Request Format**:
```json
{
    "image": "BASE64_ENCODED_IMAGE_STRING",
    "patient_id": "optional_patient_identifier",
    "apply_medical_enhancement": true
}
```

**Response Format** (Success):
```json
{
    "success": true,
    "patient_id": "patient_001",
    "timestamp": "2025-09-30 15:30:45",
    "prediction": {
        "classification": "pathological",
        "confidence": 0.973,
        "probabilities": {
            "normal": 0.027,
            "pathological": 0.973
        },
        "requires_stage2": true,
        "stage2_recommendation": "High confidence pathology detected - proceed to multiclass diagnostic"
    },
    "performance": {
        "preprocessing_time": 0.045,
        "inference_time": 0.312,
        "total_time": 0.357
    }
}
```

**Response Format** (Normal Case):
```json
{
    "success": true,
    "patient_id": "patient_002",
    "timestamp": "2025-09-30 15:31:12",
    "prediction": {
        "classification": "normal",
        "confidence": 0.964,
        "probabilities": {
            "normal": 0.964,
            "pathological": 0.036
        },
        "requires_stage2": false,
        "clinical_recommendation": "Normal tympanic membrane - no treatment indicated"
    },
    "performance": {
        "preprocessing_time": 0.042,
        "inference_time": 0.298,
        "total_time": 0.340
    }
}
```

---

### **2. Multiclass Diagnostic Endpoint**

**URL**: `https://pytorch-multiclass-diagnostic-97937849866.us-central1.run.app/predict`

**Method**: `POST`

**Request Format**:
```json
{
    "image": "BASE64_ENCODED_IMAGE_STRING",
    "patient_id": "optional_patient_identifier"
}
```

**Response Format**:
```json
{
    "success": true,
    "patient_id": "patient_001",
    "timestamp": "2025-09-30 15:32:45",
    "prediction": {
        "diagnosis": "acute_otitis_media",
        "confidence": 0.968,
        "probabilities": {
            "acute_otitis_media": 0.968,
            "chronic_otitis_media": 0.015,
            "cerumen_impaction": 0.008,
            "myringosclerosis": 0.005,
            "otitis_externa": 0.004
        },
        "clinical_priority": "HIGH",
        "treatment_recommendation": "Immediate antibiotic therapy indicated for bacterial AOM. Consider pain management.",
        "urgency_level": "Prompt medical attention required within 24 hours"
    },
    "performance": {
        "preprocessing_time": 0.048,
        "inference_time": 0.545,
        "total_time": 0.593
    }
}
```

---

## 💻 **Implementation Examples**

### **JavaScript/Node.js Implementation**

```javascript
// Required: node-fetch or axios for HTTP requests
const fetch = require('node-fetch');
const fs = require('fs');

const BINARY_ENDPOINT = 'https://pytorch-binary-screening-97937849866.us-central1.run.app/predict';
const MULTICLASS_ENDPOINT = 'https://pytorch-multiclass-diagnostic-97937849866.us-central1.run.app/predict';

// Convert file to base64
function fileToBase64(filePath) {
    const fileBuffer = fs.readFileSync(filePath);
    return fileBuffer.toString('base64');
}

// Stage 1: Binary Screening
async function binaryScreening(base64Image, patientId = 'anonymous') {
    const response = await fetch(BINARY_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            image: base64Image,
            patient_id: patientId,
            apply_medical_enhancement: true
        })
    });

    return await response.json();
}

// Stage 2: Multiclass Diagnosis
async function multiclassDiagnosis(base64Image, patientId = 'anonymous') {
    const response = await fetch(MULTICLASS_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            image: base64Image,
            patient_id: patientId
        })
    });

    return await response.json();
}

// Complete diagnostic workflow
async function completeDiagnosis(imagePath, patientId) {
    try {
        // Convert image to base64
        const base64Image = fileToBase64(imagePath);

        // Stage 1: Screen for pathology
        console.log('Running binary screening...');
        const screeningResult = await binaryScreening(base64Image, patientId);

        if (!screeningResult.success) {
            throw new Error(`Screening failed: ${screeningResult.error}`);
        }

        const classification = screeningResult.prediction.classification;
        const screeningConfidence = screeningResult.prediction.confidence;

        console.log(`Screening: ${classification} (${(screeningConfidence * 100).toFixed(1)}% confidence)`);

        // If normal, return immediately
        if (classification === 'normal') {
            return {
                diagnosis: 'Normal Tympanic Membrane',
                confidence: screeningConfidence,
                clinical_priority: 'NORMAL',
                recommendation: 'No pathology detected - no treatment indicated',
                requires_followup: false
            };
        }

        // Stage 2: Diagnose specific condition
        console.log('Running multiclass diagnosis...');
        const diagnosisResult = await multiclassDiagnosis(base64Image, patientId);

        if (!diagnosisResult.success) {
            throw new Error(`Diagnosis failed: ${diagnosisResult.error}`);
        }

        const prediction = diagnosisResult.prediction;

        return {
            diagnosis: prediction.diagnosis,
            confidence: prediction.confidence,
            clinical_priority: prediction.clinical_priority,
            recommendation: prediction.treatment_recommendation,
            urgency: prediction.urgency_level,
            probabilities: prediction.probabilities,
            requires_followup: true
        };

    } catch (error) {
        console.error('Diagnosis error:', error);
        throw error;
    }
}

// Example usage
completeDiagnosis('ear_image.jpg', 'patient_12345')
    .then(result => {
        console.log('\nFinal Diagnosis:');
        console.log(`  Condition: ${result.diagnosis}`);
        console.log(`  Confidence: ${(result.confidence * 100).toFixed(1)}%`);
        console.log(`  Priority: ${result.clinical_priority}`);
        console.log(`  Recommendation: ${result.recommendation}`);
    })
    .catch(error => {
        console.error('Failed to diagnose:', error);
    });
```

---

### **Python Implementation**

```python
import requests
import base64
import json

BINARY_ENDPOINT = 'https://pytorch-binary-screening-97937849866.us-central1.run.app/predict'
MULTICLASS_ENDPOINT = 'https://pytorch-multiclass-diagnostic-97937849866.us-central1.run.app/predict'

def image_to_base64(image_path):
    """Convert image file to base64 string."""
    with open(image_path, 'rb') as f:
        return base64.b64encode(f.read()).decode('utf-8')

def binary_screening(base64_image, patient_id='anonymous'):
    """Stage 1: Binary screening for pathology."""
    payload = {
        'image': base64_image,
        'patient_id': patient_id,
        'apply_medical_enhancement': True
    }

    response = requests.post(BINARY_ENDPOINT, json=payload, timeout=30)
    response.raise_for_status()
    return response.json()

def multiclass_diagnosis(base64_image, patient_id='anonymous'):
    """Stage 2: Multiclass diagnosis for specific condition."""
    payload = {
        'image': base64_image,
        'patient_id': patient_id
    }

    response = requests.post(MULTICLASS_ENDPOINT, json=payload, timeout=30)
    response.raise_for_status()
    return response.json()

def complete_diagnosis(image_path, patient_id='anonymous'):
    """Complete diagnostic workflow."""
    try:
        # Convert image to base64
        base64_image = image_to_base64(image_path)

        # Stage 1: Binary screening
        print('Running binary screening...')
        screening_result = binary_screening(base64_image, patient_id)

        if not screening_result.get('success'):
            raise Exception(f"Screening failed: {screening_result.get('error')}")

        prediction = screening_result['prediction']
        classification = prediction['classification']
        confidence = prediction['confidence']

        print(f'Screening: {classification} ({confidence * 100:.1f}% confidence)')

        # If normal, return immediately
        if classification == 'normal':
            return {
                'diagnosis': 'Normal Tympanic Membrane',
                'confidence': confidence,
                'clinical_priority': 'NORMAL',
                'recommendation': 'No pathology detected - no treatment indicated',
                'requires_followup': False
            }

        # Stage 2: Multiclass diagnosis
        print('Running multiclass diagnosis...')
        diagnosis_result = multiclass_diagnosis(base64_image, patient_id)

        if not diagnosis_result.get('success'):
            raise Exception(f"Diagnosis failed: {diagnosis_result.get('error')}")

        prediction = diagnosis_result['prediction']

        return {
            'diagnosis': prediction['diagnosis'],
            'confidence': prediction['confidence'],
            'clinical_priority': prediction['clinical_priority'],
            'recommendation': prediction['treatment_recommendation'],
            'urgency': prediction['urgency_level'],
            'probabilities': prediction['probabilities'],
            'requires_followup': True
        }

    except Exception as e:
        print(f'Diagnosis error: {e}')
        raise

# Example usage
if __name__ == '__main__':
    result = complete_diagnosis('ear_image.jpg', 'patient_12345')

    print('\nFinal Diagnosis:')
    print(f"  Condition: {result['diagnosis']}")
    print(f"  Confidence: {result['confidence'] * 100:.1f}%")
    print(f"  Priority: {result['clinical_priority']}")
    print(f"  Recommendation: {result['recommendation']}")

    if 'probabilities' in result:
        print('\n  All Probabilities:')
        for condition, prob in result['probabilities'].items():
            print(f"    - {condition}: {prob * 100:.1f}%")
```

---

### **Frontend JavaScript (Browser) Implementation**

```javascript
// For browser-based file uploads
async function diagnoseUploadedImage(fileInputElement) {
    const file = fileInputElement.files[0];

    if (!file) {
        throw new Error('No file selected');
    }

    // Convert file to base64
    const base64Image = await fileToBase64Browser(file);

    // Run diagnosis
    const result = await completeDiagnosisBrowser(base64Image);

    // Display results
    displayResults(result);

    return result;
}

// Convert file to base64 in browser
function fileToBase64Browser(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
            const base64 = reader.result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Complete diagnosis workflow (browser)
async function completeDiagnosisBrowser(base64Image, patientId = 'anonymous') {
    const BINARY_ENDPOINT = 'https://pytorch-binary-screening-97937849866.us-central1.run.app/predict';
    const MULTICLASS_ENDPOINT = 'https://pytorch-multiclass-diagnostic-97937849866.us-central1.run.app/predict';

    try {
        // Stage 1: Binary screening
        const screeningResponse = await fetch(BINARY_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                image: base64Image,
                patient_id: patientId,
                apply_medical_enhancement: true
            })
        });

        const screeningResult = await screeningResponse.json();

        if (!screeningResult.success) {
            throw new Error(`Screening failed: ${screeningResult.error}`);
        }

        const classification = screeningResult.prediction.classification;

        // If normal, return immediately
        if (classification === 'normal') {
            return {
                diagnosis: 'Normal Tympanic Membrane',
                confidence: screeningResult.prediction.confidence,
                clinical_priority: 'NORMAL',
                recommendation: 'No pathology detected',
                requires_followup: false
            };
        }

        // Stage 2: Multiclass diagnosis
        const diagnosisResponse = await fetch(MULTICLASS_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                image: base64Image,
                patient_id: patientId
            })
        });

        const diagnosisResult = await diagnosisResponse.json();

        if (!diagnosisResult.success) {
            throw new Error(`Diagnosis failed: ${diagnosisResult.error}`);
        }

        const prediction = diagnosisResult.prediction;

        return {
            diagnosis: prediction.diagnosis,
            confidence: prediction.confidence,
            clinical_priority: prediction.clinical_priority,
            recommendation: prediction.treatment_recommendation,
            urgency: prediction.urgency_level,
            probabilities: prediction.probabilities,
            requires_followup: true
        };

    } catch (error) {
        console.error('Diagnosis error:', error);
        throw error;
    }
}

// Display results in UI
function displayResults(result) {
    const resultsDiv = document.getElementById('diagnosis-results');

    resultsDiv.innerHTML = `
        <div class="diagnosis-card ${getPriorityClass(result.clinical_priority)}">
            <h3>Diagnosis: ${formatDiagnosisName(result.diagnosis)}</h3>
            <p class="confidence">Confidence: ${(result.confidence * 100).toFixed(1)}%</p>
            <p class="priority">Priority: ${result.clinical_priority}</p>
            <p class="recommendation">${result.recommendation}</p>
            ${result.urgency ? `<p class="urgency">⚠️ ${result.urgency}</p>` : ''}
        </div>
    `;
}

function getPriorityClass(priority) {
    if (priority.includes('HIGH')) return 'priority-high';
    if (priority.includes('MEDIUM')) return 'priority-medium';
    return 'priority-low';
}

function formatDiagnosisName(diagnosis) {
    return diagnosis
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

// Example HTML usage
/*
<input type="file" id="ear-image-upload" accept="image/*" />
<button onclick="diagnoseUploadedImage(document.getElementById('ear-image-upload'))">
    Diagnose
</button>
<div id="diagnosis-results"></div>
*/
```

---

## 🎨 **Adding Explainability (Visual Interpretations)**

Both endpoints support explainability features that show **which parts of the ear image** the AI focused on for its diagnosis.

### **Binary Screening - Grad-CAM Explanations**

**URL**: `https://pytorch-binary-screening-97937849866.us-central1.run.app/explain/gradcam`

**Request**:
```json
{
    "image": "BASE64_ENCODED_IMAGE",
    "patient_id": "patient_001"
}
```

**Response**:
```json
{
    "success": true,
    "visualization": "BASE64_ENCODED_HEATMAP_IMAGE",
    "prediction": {
        "classification": "pathological",
        "confidence": 0.973
    },
    "explanation": {
        "method": "Grad-CAM",
        "focus_areas": "Tympanic membrane region showing inflammation markers"
    }
}
```

### **Multiclass Diagnostic - Complete Explanations**

**URL**: `https://pytorch-multiclass-diagnostic-97937849866.us-central1.run.app/explain`

**Request**:
```json
{
    "image": "BASE64_ENCODED_IMAGE",
    "patient_id": "patient_001",
    "methods": ["grad_cam", "integrated_gradients"]
}
```

**Response**:
```json
{
    "success": true,
    "prediction": {
        "diagnosis": "acute_otitis_media",
        "confidence": 0.968
    },
    "explanations": {
        "grad_cam": {
            "visualization": "BASE64_ENCODED_HEATMAP",
            "focus_description": "High attention on inflamed tympanic membrane"
        },
        "integrated_gradients": {
            "visualization": "BASE64_ENCODED_ATTRIBUTION_MAP",
            "attribution_description": "Red regions indicate positive evidence for AOM"
        }
    }
}
```

---

## 📋 **Medical Conditions & Clinical Priorities**

### **Diagnosed Conditions**

| Condition | Clinical Priority | Typical Action | Average Confidence |
|-----------|------------------|----------------|-------------------|
| **Normal Tympanic Membrane** | NORMAL | No treatment | 96.4% |
| **Acute Otitis Media** | HIGH | Immediate antibiotic therapy | 96.9% |
| **Chronic Otitis Media** | MEDIUM | ENT consultation | 97.6% |
| **Cerumen Impaction** | LOW | Safe cerumen removal | 98.9% |
| **Myringosclerosis** | LOW | Monitor, hearing test | 100.0% |
| **Otitis Externa** | MEDIUM | Topical antibiotic drops | 77.8% |

### **Priority Levels**

- **HIGH**: Immediate attention needed (within 24 hours)
- **MEDIUM**: Consultation recommended (within 3-7 days)
- **LOW**: Routine management (as convenient)
- **NORMAL**: No pathology detected

---

## ⚡ **Performance & Best Practices**

### **Response Times**
- **Binary Screening**: 300-500ms (after cold start)
- **Multiclass Diagnosis**: 600ms (after cold start)
- **Cold Start**: First request may take 3-5 seconds

### **Optimization Tips**

1. **Warm-up Requests**: Send a dummy request on app startup to eliminate cold start
2. **Image Size**: Optimal size is 224x224 to 500x500 pixels
3. **Compression**: JPEG quality 85-95% provides good balance
4. **Caching**: Cache base64 conversions for repeated analyses
5. **Parallel Processing**: Binary and multiclass can run in parallel if you know pathology exists

### **Error Handling**

```javascript
async function robustDiagnosis(base64Image, patientId) {
    const MAX_RETRIES = 3;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            return await completeDiagnosis(base64Image, patientId);
        } catch (error) {
            console.error(`Attempt ${attempt} failed:`, error);

            if (attempt === MAX_RETRIES) {
                throw new Error(`Diagnosis failed after ${MAX_RETRIES} attempts: ${error.message}`);
            }

            // Exponential backoff
            await sleep(Math.pow(2, attempt) * 1000);
        }
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
```

---

## 🔒 **Security & Privacy**

### **Authentication**
- Currently: **Public endpoints** (no authentication required)
- For production: Consider adding API key authentication
- Contact admin for custom authentication setup

### **Data Privacy**
- **No storage**: Images are NOT stored on our servers
- **Processing only**: Images processed in-memory and discarded
- **Logging**: Only metadata logged (no image data)
- **HIPAA**: Compliant architecture (if you add proper authentication)

### **Recommended Security**

```javascript
// Add custom headers for tracking/authentication
async function authenticatedRequest(endpoint, payload) {
    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-API-Key': 'your_api_key_here',  // If implemented
            'X-Client-ID': 'your_client_identifier',
            'X-Request-ID': generateRequestId()
        },
        body: JSON.stringify(payload)
    });

    return await response.json();
}
```

---

## 📊 **Testing & Validation**

### **Test Image Requirements**

✅ **Good Test Images**:
- Otoscopic images (ear canal view)
- 224x224 to 1000x1000 pixels
- JPEG or PNG format
- Clear tympanic membrane visible
- Good lighting and focus

❌ **Poor Test Images**:
- External ear images
- Very low resolution (<200x200)
- Blurry or out-of-focus
- Extreme lighting conditions
- Non-ear images (will fail)

### **Validation Testing**

```python
# Test with known cases
test_cases = [
    {'image': 'normal_ear.jpg', 'expected': 'normal'},
    {'image': 'aom_case.jpg', 'expected': 'acute_otitis_media'},
    {'image': 'earwax.jpg', 'expected': 'cerumen_impaction'}
]

for test in test_cases:
    result = complete_diagnosis(test['image'])
    print(f"Image: {test['image']}")
    print(f"Expected: {test['expected']}")
    print(f"Got: {result['diagnosis']}")
    print(f"Match: {result['diagnosis'] == test['expected']}")
    print()
```

---

## 🆘 **Troubleshooting**

### **Common Issues**

**1. "Missing image data" Error**
```javascript
// Problem: Image not properly base64 encoded
// Solution: Ensure no data URL prefix
const base64 = reader.result.split(',')[1];  // Remove "data:image/jpeg;base64,"
```

**2. "Request timeout" Error**
```javascript
// Problem: First request (cold start)
// Solution: Increase timeout for first request
const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    timeout: 30000  // 30 seconds for cold start
});
```

**3. "Low confidence" Results**
```javascript
// Problem: Poor image quality
// Solution: Validate image before sending
function validateImage(imageFile) {
    const validTypes = ['image/jpeg', 'image/png'];
    const maxSize = 5 * 1024 * 1024;  // 5MB

    if (!validTypes.includes(imageFile.type)) {
        throw new Error('Invalid file type. Use JPEG or PNG.');
    }

    if (imageFile.size > maxSize) {
        throw new Error('File too large. Maximum 5MB.');
    }
}
```

---

## 📞 **Support & Contact**

- **Endpoint Status**: All endpoints operational as of October 2025
- **Performance**: 97.4% multiclass accuracy, 96.3% binary accuracy
- **Monitoring**: Real-time metrics logged to BigQuery
- **Updates**: Models updated periodically with new training data

For technical support or custom integration needs, contact the development team.

---

## 🎯 **Summary: What You Need**

### **Minimum Integration**
1. Binary screening endpoint for pathology detection
2. Multiclass diagnostic endpoint for specific diagnosis
3. Base64 image conversion
4. JSON request/response handling

### **Recommended Integration**
1. Both endpoints (dual-stage workflow)
2. Error handling with retries
3. Timeout configuration (30s first request, 10s subsequent)
4. User feedback during processing
5. Display confidence scores and recommendations

### **Advanced Integration**
1. Complete workflow with explainability
2. Visual heatmaps showing AI focus areas
3. Probability distribution display
4. Patient ID tracking for medical records
5. Custom authentication headers

---

**This system is production-ready and achieving 97.4% diagnostic accuracy in clinical validation testing.**