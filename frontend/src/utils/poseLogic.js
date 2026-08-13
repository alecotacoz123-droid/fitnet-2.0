// poseLogic.js
// Funciones matemáticas para calcular ángulos articulares a partir de keypoints (x, y)

export const calculateAngle = (pointA, pointB, pointC) => {
  if (!pointA || !pointB || !pointC) return 0;
  
  const radians = Math.atan2(pointC.y - pointB.y, pointC.x - pointB.x) - 
                  Math.atan2(pointA.y - pointB.y, pointA.x - pointB.x);
  
  let angle = Math.abs((radians * 180.0) / Math.PI);
  if (angle > 180.0) {
    angle = 360 - angle;
  }
  return angle;
};

// Analizador de Squats (Sentadillas)
export const analyzeSquat = (keypoints, currentState, updateState, addRep, provideFeedback) => {
  const getJointAngle = (hip, knee, ankle) => {
    const h = keypoints.find(k => k.name === hip);
    const k = keypoints.find(k => k.name === knee);
    const a = keypoints.find(k => k.name === ankle);
    if (h && k && a && h.score > 0.3 && k.score > 0.3 && a.score > 0.3) {
      return calculateAngle(h, k, a);
    }
    return null;
  };

  let angle = getJointAngle('left_hip', 'left_knee', 'left_ankle');
  if (!angle) angle = getJointAngle('right_hip', 'right_knee', 'right_ankle');

  if (angle) {
    if (angle > 150) {
      if (currentState === 'down') {
        addRep(); // Repetición completa
        provideFeedback('¡Excelente!');
      }
      updateState('up');
    } else if (angle < 100) {
      if (currentState !== 'down') {
        provideFeedback('Sube con fuerza');
      }
      updateState('down');
    } else if (angle >= 100 && angle <= 140 && currentState === 'up') {
      provideFeedback('Baja más...');
    }
  } else {
    provideFeedback('Acomódate en la cámara');
  }
};

// Analizador de Flexiones (Pushups)
export const analyzePushup = (keypoints, currentState, updateState, addRep, provideFeedback) => {
  const getJointAngle = (shoulder, elbow, wrist) => {
    const s = keypoints.find(k => k.name === shoulder);
    const e = keypoints.find(k => k.name === elbow);
    const w = keypoints.find(k => k.name === wrist);
    if (s && e && w && s.score > 0.3 && e.score > 0.3 && w.score > 0.3) {
      return calculateAngle(s, e, w);
    }
    return null;
  };

  let angle = getJointAngle('left_shoulder', 'left_elbow', 'left_wrist');
  if (!angle) angle = getJointAngle('right_shoulder', 'right_elbow', 'right_wrist');

  if (angle) {
    if (angle > 150) {
      if (currentState === 'down') {
        addRep();
        provideFeedback('Buena repetición');
      }
      updateState('up');
    } else if (angle < 90) { // Codos flexionados
      updateState('down');
      provideFeedback('Empuja!');
    } else if (angle >= 90 && angle < 140 && currentState === 'up') {
      provideFeedback('Baja el pecho');
    }
  } else {
    provideFeedback('Acomódate en la cámara');
  }
};
