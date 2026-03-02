import React, { useState } from 'react';
import {
  IonContent, IonPage, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
  IonItem, IonLabel, IonInput, IonTextarea, IonButton, IonLoading, IonToast, IonIcon
} from '@ionic/react';
import { imageOutline } from 'ionicons/icons'; // เพิ่มตัวนี้เข้ามา
import { auth, db } from '../firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useHistory } from 'react-router-dom';
import './CreateRecipe.css'; 

const CreateFeed: React.FC = () => {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const history = useHistory();

  const handlePostFeed = async () => {
    const user = auth.currentUser;
    if (!user) {
      setToastMsg("กรุณาเข้าสู่ระบบก่อนโพสต์");
      return;
    }
    if (!title.trim()) {
      setToastMsg("กรุณาใส่หัวข้อที่ต้องการคุย");
      return;
    }

    setLoading(true);
    try {
      // ใช้รูปภาพเริ่มต้นจากในเครื่องของคุณ
      const feedImageUrl = "/assets/2771401.png";

      // Logic ดึงชื่อ: ถ้าไม่มี displayName ให้ตัดชื่อหน้า @ จาก Email
      const authorDisplayName = user.displayName || user.email?.split('@')[0] || "สมาชิก";

      await addDoc(collection(db, "feeds"), {
        title: title.trim(),
        desc: desc,
        img: feedImageUrl,
        // เก็บข้อมูลชื่อที่ดึงจาก Email ลงไปด้วย
        userName: authorDisplayName,
        userEmail: user.email,
        userAvatar: user.photoURL || "https://ionicframework.com/docs/img/demos/avatar.svg",
        userId: user.uid,
        comments: 0,
        createdAt: serverTimestamp()
      });

      setLoading(false);
      setToastMsg("โพสต์ฟีดสำเร็จ!");
      setTimeout(() => history.push('/home'), 1500);
    } catch (error: any) {
      setLoading(false);
      setToastMsg("เกิดข้อผิดพลาด: " + error.message);
    }
  };

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar className="create-recipe-toolbar">
          <IonButtons slot="start"><IonBackButton defaultHref="/home" color="light" /></IonButtons>
          <IonTitle>เขียนโพสต์ใหม่</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {/* ส่วนแสดงรูปภาพพรีวิว */}
        <div className="image-upload-box" style={{ backgroundSize: 'cover', position: 'relative' }}>
          <div className="upload-placeholder" style={{ background: 'rgba(255,255,255,0.6)', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <IonIcon icon={imageOutline} style={{ fontSize: '40px' }} />
            <p>ระบบรูปภาพปิดชั่วคราว (ใช้ภาพเริ่มต้น)</p>
          </div>
        </div>

        <div style={{ textAlign: 'center', margin: '20px 0', color: '#688049' }}>
          <h2 style={{ fontWeight: 'bold' }}></h2>
        </div>

        <IonItem lines="none" className="custom-input-item">
          <IonLabel position="stacked">หัวข้อโพสต์</IonLabel>
          <IonInput 
            placeholder="คุณคิดอะไรอยู่..." 
            value={title}
            onIonInput={(e) => setTitle(e.detail.value!)} 
          />
        </IonItem>

        <IonItem lines="none" className="custom-input-item">
          <IonLabel position="stacked">รายละเอียด</IonLabel>
          <IonTextarea 
            placeholder="เล่ารายละเอียดเพิ่มเติมที่นี่..." 
            value={desc}
            onIonInput={(e) => setDesc(e.detail.value!)} 
            rows={8} 
          />
        </IonItem>

        <IonButton expand="block" onClick={handlePostFeed} className="post-btn">โพสต์ลงหน้าฟีด</IonButton>
        
        <IonLoading isOpen={loading} message="กำลังส่งโพสต์..." />
        <IonToast isOpen={!!toastMsg} message={toastMsg} duration={2000} onDidDismiss={() => setToastMsg('')} />
      </IonContent>
    </IonPage>
  );
};

export default CreateFeed;