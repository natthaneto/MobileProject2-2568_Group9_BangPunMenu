import React, { useState } from 'react';
import {
  IonContent, IonPage, IonItem, IonInput, IonButton, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonLabel
} from '@ionic/react';
import { auth, db } from '../firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useHistory } from 'react-router-dom';
import './Login.css'; // ใช้ไฟล์ CSS ร่วมกับ Login ได้เลยครับ

const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const history = useHistory();

  const handleRegister = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: name,
        email: email,
        createdAt: new Date()
      });

      alert("สมัครสมาชิกสำเร็จ!");
      history.push('/home');
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar className="create-recipe-toolbar">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/login" color="light" />
          </IonButtons>
          <IonTitle>สมัครสมาชิก</IonTitle>
        </IonToolbar>
      </IonHeader>
      

      <IonContent className="ion-padding">
        <div className="login-container" style={{ marginTop: '20px' }}>
          <div className="login-header">
            <h1>BangPunMenu</h1>
          </div>
          
          <div className="form-group">
            <IonItem lines="none" className="custom-input-item">
              <IonLabel position="stacked">Username</IonLabel>
              <IonInput 
                placeholder="ชื่อของคุณ"
                onIonInput={(e) => setName(e.detail.value!)} 
              />
            </IonItem>

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
                placeholder="รหัสผ่าน 6 ตัวขึ้นไป"
                onIonInput={(e) => setPassword(e.detail.value!)} 
              />
            </IonItem>
          </div>

          <IonButton expand="block" onClick={handleRegister} className="main-btn">
            ยืนยันการสมัคร
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Register;