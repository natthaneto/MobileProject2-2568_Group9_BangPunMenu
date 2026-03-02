import React, { useState } from 'react';
import {
  IonContent, IonPage, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
  IonItem, IonLabel, IonInput, IonTextarea, IonSelect, IonSelectOption, IonButton,
  IonLoading, IonToast, IonIcon
} from '@ionic/react';
import { imageOutline } from 'ionicons/icons';
import { auth, db } from '../firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useHistory } from 'react-router-dom';
import './CreateRecipe.css';

const CreateRecipe: React.FC = () => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [steps, setSteps] = useState('');
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const history = useHistory();

  const handleSendRecipe = async () => {
    const user = auth.currentUser;

    if (!user) {
      setToastMsg("กรุณาเข้าสู่ระบบก่อน");
      return;
    }

    // --- บังคับกรอกทุกช่อง ---
    if (!name.trim()) {
      setToastMsg("กรุณากรอกชื่อเมนูอาหาร");
      return;
    }
    if (!category) {
      setToastMsg("กรุณาเลือกหมวดหมู่");
      return;
    }
    if (!ingredients.trim()) {
      setToastMsg("กรุณาระบุวัตถุดิบ");
      return;
    }
    if (!steps.trim()) {
      setToastMsg("กรุณาระบุขั้นตอนการทำ");
      return;
    }

    setLoading(true);
    try {
      const finalImageUrl = "/assets/2771401.png";
      
      await addDoc(collection(db, "recipes"), {
        name: name.trim(),
        category: category,
        ingredients: ingredients.trim(),
        steps: steps.trim(),
        imageUrl: finalImageUrl,
        authorId: user.uid,
        authorName: user.displayName || user.email?.split('@')[0] || "สมาชิก",
        authorEmail: user.email,
        authorAvatar: user.photoURL || "https://ionicframework.com/docs/img/demos/avatar.svg",
        createdAt: serverTimestamp()
      });

      setLoading(false);
      setToastMsg("บันทึกเมนูสำเร็จ!");
      setTimeout(() => history.push('/recipes'), 1500);
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
          <IonTitle>เพิ่มสูตรอาหาร</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <div className="image-upload-box" >
          <div className="upload-placeholder" style={{ background: 'rgba(255,255,255,0.6)' }}>
            <IonIcon icon={imageOutline} />
            <p>ระบบรูปภาพปิดชั่วคราว (ใช้ภาพเริ่มต้น)</p>
          </div>
        </div>

        <IonItem lines="none" className="custom-input-item">
          <IonLabel position="stacked">ชื่อเมนูอาหาร <span style={{color:'red'}}>*</span></IonLabel>
          <IonInput
            placeholder="เช่น ข้าวผัดกะเพรา"
            value={name}
            onIonInput={(e) => setName(e.detail.value!)}
          />
        </IonItem>

        <IonItem lines="none" className="custom-input-item">
          <IonLabel position="stacked">หมวดหมู่ <span style={{color:'red'}}>*</span></IonLabel>
          <IonSelect
            placeholder="เลือกหมวดหมู่"
            value={category}
            onIonChange={(e) => setCategory(e.detail.value)}
          >
            <IonSelectOption value="esarn">อาหารอีสาน</IonSelectOption>
            <IonSelectOption value="thai">อาหารไทย</IonSelectOption>
            <IonSelectOption value="halal">อาหารฮาลาล</IonSelectOption>
            <IonSelectOption value="national">อาหารต่างชาติ</IonSelectOption>
          </IonSelect>
        </IonItem>

        <IonItem lines="none" className="custom-input-item">
          <IonLabel position="stacked">วัตถุดิบ <span style={{color:'red'}}>*</span></IonLabel>
          <IonTextarea
            placeholder="ระบุวัตถุดิบ..."
            value={ingredients}
            onIonInput={(e) => setIngredients(e.detail.value!)}
            rows={4}
          />
        </IonItem>

        <IonItem lines="none" className="custom-input-item">
          <IonLabel position="stacked">ขั้นตอนการทำ <span style={{color:'red'}}>*</span></IonLabel>
          <IonTextarea
            placeholder="ระบุวิธีทำ..."
            value={steps}
            onIonInput={(e) => setSteps(e.detail.value!)}
            rows={6}
          />
        </IonItem>

        <IonButton expand="block" onClick={handleSendRecipe} className="post-btn">ลงสูตรอาหาร</IonButton>

        <IonLoading isOpen={loading} message="กำลังบันทึก..." />
        <IonToast isOpen={!!toastMsg} message={toastMsg} duration={2000} onDidDismiss={() => setToastMsg('')} />
      </IonContent>
    </IonPage>
  );
};

export default CreateRecipe;