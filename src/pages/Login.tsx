import React, { useState } from 'react';
import {
  IonContent, IonPage, IonItem, IonInput, IonButton, IonText, IonLoading, IonToast, IonLabel
} from '@ionic/react';
import { auth } from '../firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useHistory } from 'react-router-dom';
import './Login.css'; // ตรวจสอบว่าชื่อไฟล์ CSS ตรงกันนะครับ

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showLoading, setShowLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const history = useHistory();

  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMsg("กรุณากรอกอีเมลและรหัสผ่าน");
      return;
    }
    setShowLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setShowLoading(false);
      history.push('/home');
    } catch (error: any) {
      setShowLoading(false);
      setErrorMsg("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
    }
  };

  return (
    <IonPage>
      <IonContent className="ion-padding">
        <div className="login-container">
          <div className="login-header">
            <h1>BangPunMenu</h1>
            <p>เข้าสู่ระบบเพื่อแบ่งปันเมนูอาหาร</p>
          </div>

          <div className="form-group">
            <IonItem lines="none" className="custom-input-item">
              <IonLabel position="stacked">Email</IonLabel>
              <IonInput
                type="email"
                placeholder="example@gmail.com"
                onIonInput={(e) => setEmail(e.detail.value!)}
              />
            </IonItem>

            <IonItem lines="none" className="custom-input-item">
              <IonLabel position="stacked">Password</IonLabel>
              <IonInput
                type="password"
                placeholder="********"
                onIonInput={(e) => setPassword(e.detail.value!)}
              />
            </IonItem>
          </div>

          <IonButton expand="block" onClick={handleLogin} className="main-btn">
            เข้าสู่ระบบ
          </IonButton>

          <IonText color="medium" className="clickable-text" onClick={() => history.push('/register')}>
            <p>ยังไม่มีบัญชี? <b>สมัครสมาชิกที่นี่</b></p>
          </IonText>
        </div>

        <IonLoading isOpen={showLoading} message={'กำลังเข้าสู่ระบบ...'} />
        <IonToast isOpen={!!errorMsg} message={errorMsg} duration={2000} onDidDismiss={() => setErrorMsg('')} color="danger" />
      </IonContent>
    </IonPage>
  );
};

export default Login;