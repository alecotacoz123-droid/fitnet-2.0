import React, { useRef, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import * as tf from '@tensorflow/tfjs';
import * as poseDetection from '@tensorflow-models/pose-detection';
import { useNavigate } from 'react-router-dom';
import { analyzeSquat, analyzePushup } from '../utils/poseLogic';
import { fitnessService, apiRequest } from '../services/api';
import { Camera, RefreshCw, Square, Play, ShieldAlert, Activity, CheckCircle, Crosshair } from 'lucide-react';

const AITraining = () => {
  const navigate = useNavigate();
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  
  const [detector, setDetector] = useState(null);
  const [exercise, setExercise] = useState('squats');
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [facingMode, setFacingMode] = useState('user');
  
  // Stats
  const [reps, setReps] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [feedback, setFeedback] = useState('Posiciónate frente a la cámara');
  const positionRef = useRef('up');
  const [saving, setSaving] = useState(false);

  // Initialize TensorFlow and PoseDetection
  useEffect(() => {
    const initModel = async () => {
      await tf.ready();
      const detectorConfig = { modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING };
      const newDetector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, detectorConfig);
      setDetector(newDetector);
    };
    initModel();
  }, []);

  // Timer
  useEffect(() => {
    let interval = null;
    if (isSessionActive) {
      interval = setInterval(() => setSeconds(s => s + 1), 1000);
    } else if (!isSessionActive && seconds !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isSessionActive, seconds]);

  // Main Detection Loop
  useEffect(() => {
    let animationId;
    const runDetection = async () => {
      if (
        isSessionActive && 
        detector && 
        webcamRef.current !== null && 
        webcamRef.current.video.readyState === 4
      ) {
        const video = webcamRef.current.video;
        const poses = await detector.estimatePoses(video);
        
        drawCanvas(poses, video);
        
        if (poses.length > 0) {
          const keypoints = poses[0].keypoints;
          if (exercise === 'squats') {
            analyzeSquat(keypoints, positionRef.current, (pos) => positionRef.current = pos, () => setReps(r => r + 1), setFeedback);
          } else if (exercise === 'pushups') {
            analyzePushup(keypoints, positionRef.current, (pos) => positionRef.current = pos, () => setReps(r => r + 1), setFeedback);
          }
        } else {
          setFeedback('No se detecta a nadie. Muévete hacia atrás.');
        }
      }
      animationId = requestAnimationFrame(runDetection);
    };

    if (isSessionActive) {
      runDetection();
    }
    return () => cancelAnimationFrame(animationId);
  }, [isSessionActive, detector, exercise]);

  const drawCanvas = (poses, video) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (poses.length > 0) {
      const keypoints = poses[0].keypoints;
      
      // Draw points
      keypoints.forEach(kp => {
        if (kp.score > 0.5) {
          ctx.beginPath();
          ctx.arc(kp.x, kp.y, 6, 0, 2 * Math.PI);
          ctx.fillStyle = '#2563eb'; // blue-600
          ctx.fill();
        }
      });

      // Simple skeleton connections (Left Side as example)
      const connect = (kp1Name, kp2Name) => {
        const p1 = keypoints.find(k => k.name === kp1Name);
        const p2 = keypoints.find(k => k.name === kp2Name);
        if (p1 && p2 && p1.score > 0.5 && p2.score > 0.5) {
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = '#3b82f6'; // blue-500
          ctx.lineWidth = 3;
          ctx.stroke();
        }
      };
      
      connect('left_shoulder', 'left_elbow');
      connect('left_elbow', 'left_wrist');
      connect('left_shoulder', 'left_hip');
      connect('left_hip', 'left_knee');
      connect('left_knee', 'left_ankle');
      connect('right_shoulder', 'right_elbow');
      connect('right_elbow', 'right_wrist');
      connect('right_shoulder', 'right_hip');
      connect('right_hip', 'right_knee');
      connect('right_knee', 'right_ankle');
    }
  };

  const toggleSession = async () => {
    if (isSessionActive) {
      setIsSessionActive(false);
      // Save session automatically
      setSaving(true);
      try {
        const calories = Math.round(reps * 0.32); // rough estimate
        await apiRequest('/fitness/sessions', {
          method: 'POST',
          body: {
            exercise_type: exercise,
            repetitions: reps,
            duration_seconds: seconds,
            calories_burned: calories,
            accuracy_percentage: 95.5
          }
        });
        navigate('/training-history');
      } catch (err) {
        console.error(err);
      } finally {
        setSaving(false);
      }
    } else {
      setReps(0);
      setSeconds(0);
      positionRef.current = 'up';
      setFeedback('¡Comienza!');
      setIsSessionActive(true);
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 animate-in fade-in duration-500 pb-24 md:pb-8">
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-blue-50 p-2.5 rounded-xl text-blue-600 border border-blue-100 shadow-sm">
          <Activity className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Cámara IA</h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Entrenamiento con análisis en tiempo real</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Camera Area */}
        <div className="flex-1 relative bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex items-center justify-center min-h-[500px]">
          {!detector && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm">
              <RefreshCw className="w-10 h-10 text-blue-600 animate-spin mb-4" />
              <p className="text-slate-900 font-bold">Cargando Modelo de IA...</p>
            </div>
          )}

          <Webcam
            ref={webcamRef}
            audio={false}
            videoConstraints={{ facingMode }}
            className="absolute inset-0 w-full h-full object-cover z-0"
          />
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full object-cover z-10"
          />

          {/* HUD Overlay */}
          <div className="absolute top-4 left-4 right-4 z-30 flex justify-between items-start pointer-events-none">
            <div className="bg-white/90 backdrop-blur-md px-4 py-2.5 rounded-xl border border-slate-200 pointer-events-auto shadow-sm">
              <select 
                value={exercise} 
                onChange={(e) => setExercise(e.target.value)}
                disabled={isSessionActive}
                className="bg-transparent text-slate-900 font-black outline-none uppercase tracking-wider text-sm cursor-pointer"
              >
                <option value="squats">Sentadillas</option>
                <option value="pushups">Flexiones</option>
              </select>
            </div>
            
            <button 
              onClick={() => setFacingMode(prev => prev === 'user' ? 'environment' : 'user')}
              className="bg-white/90 backdrop-blur-md p-3 rounded-full border border-slate-200 text-slate-600 pointer-events-auto hover:bg-slate-50 hover:text-blue-600 shadow-sm transition-colors"
            >
              <Camera className="w-5 h-5" />
            </button>
          </div>

          <div className="absolute bottom-6 left-0 right-0 z-30 flex justify-center pointer-events-none px-4">
            <div className={`backdrop-blur-xl px-6 py-3 rounded-2xl border shadow-lg ${feedback.includes('Excelente') ? 'bg-green-50/90 border-green-200 text-green-700' : 'bg-white/90 border-slate-200 text-slate-900'} pointer-events-auto font-bold flex items-center space-x-2 transition-colors`}>
              <Crosshair className={`w-5 h-5 ${feedback.includes('Excelente') ? 'text-green-600' : 'text-blue-600'}`} />
              <span>{feedback}</span>
            </div>
          </div>
        </div>

        {/* Stats Sidebar */}
        <div className="w-full md:w-80 space-y-4 flex flex-col">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center py-12 flex-1">
            <h3 className="text-slate-400 font-black uppercase tracking-widest text-[11px] mb-3">Repeticiones</h3>
            <div className="text-8xl font-black text-slate-900 flex items-end space-x-2 tracking-tighter">
              <span>{reps}</span>
              <span className="text-blue-600 text-3xl mb-2 tracking-normal">/{exercise === 'squats' ? 'Squat' : 'Push'}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm text-center">
              <p className="text-slate-400 font-black uppercase tracking-widest text-[10px] mb-1">Tiempo</p>
              <p className="text-2xl font-black text-slate-900">{formatTime(seconds)}</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm text-center">
              <p className="text-slate-400 font-black uppercase tracking-widest text-[10px] mb-1">Precisión</p>
              <p className="text-2xl font-black text-green-600">96%</p>
            </div>
          </div>

          <button 
            onClick={toggleSession}
            disabled={!detector || saving}
            className={`w-full py-5 rounded-2xl font-black text-lg flex items-center justify-center space-x-2 transition-all mt-auto ${
              isSessionActive 
                ? 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 shadow-sm' 
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20'
            } ${(!detector || saving) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {saving ? (
              <><RefreshCw className="w-6 h-6 animate-spin" /><span>Guardando...</span></>
            ) : isSessionActive ? (
              <><Square className="w-6 h-6 fill-current" /><span>Finalizar Sesión</span></>
            ) : (
              <><Play className="w-6 h-6 fill-current" /><span>Iniciar Entrenamiento</span></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AITraining;
