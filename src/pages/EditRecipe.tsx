import React, { useState, useEffect } from 'react';
import {
  IonContent, IonPage, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
  IonItem, IonLabel, IonInput, IonTextarea, IonSelect, IonSelectOption, IonButton,
  IonLoading, IonToast, IonIcon
} from '@ionic/react';
import { imageOutline } from 'ionicons/icons';
import { db } from '../firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useHistory, useParams } from 'react-router-dom';
import './CreateRecipe.css';

const EditRecipe: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [steps, setSteps] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // ดึงข้อมูลเดิมมาแสดง
  useEffect(() => {
    const fetchRecipe = async () => {
      if (id) {
        try {
          const docRef = doc(db, "recipes", id);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const data = docSnap.data();
            // เซ็ตค่าจาก Database ลง State ตรงๆ (ห้ามใส่เงื่อนไขดักหน้า state เดิม)
            setName(data.name || '');
            setCategory(data.category || '');
            setIngredients(data.ingredients || '');
            setSteps(data.steps || '');
          } else {
            setToastMsg("ไม่พบข้อมูลสูตรอาหารนี้ในระบบ");
          }
        } catch (error: any) {
          console.error("Error fetching recipe:", error);
          setToastMsg("เกิดข้อผิดพลาดในการโหลดข้อมูล");
        } finally {
          setLoading(false);
        }
      }
    };
    fetchRecipe();
  }, [id]);

  const handleUpdate = async () => {
    if (!name.trim() || !category) {
      setToastMsg("กรุณากรอกชื่อเมนูและเลือกหมวดหมู่");
      return;
    }

    setUpdating(true);
    try {
      const docRef = doc(db, "recipes", id);
      await updateDoc(docRef, {
        name: name.trim(),
        category: category,
        ingredients: ingredients,
        steps: steps,
        lastUpdated: new Date() 
      });
      setUpdating(false);
      setToastMsg("แก้ไขสูตรอาหารสำเร็จ!");
      // ให้รอสักพักแล้วค่อยถอยกลับไปหน้าจัดการ
      setTimeout(() => history.goBack(), 1500);
    } catch (error: any) {
      setUpdating(false);
      setToastMsg("ไม่สามารถบันทึกได้: " + error.message);
    }
  };

  if (loading) return <IonLoading isOpen={loading} message="กำลังดึงข้อมูลเดิม..." />;

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar className="create-recipe-toolbar">
          <IonButtons slot="start">
            {/* แก้ไข defaultHref ให้กลับไปหน้าจัดการโพสต์ */}
            <IonBackButton defaultHref="/post-selection" color="light" />
          </IonButtons>
          <IonTitle>แก้ไขสูตรอาหาร</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {/* ส่วนรูปภาพ (แสดงเป็นภาพนิ่งไปก่อนตามระบบปัจจุบัน) */}
        <div className="image-upload-box">
          <div className="upload-placeholder" style={{ background: 'rgba(255,255,255,0.6)' }}>
            <IonIcon icon={imageOutline} />
            <p>รูปภาพเริ่มต้น (ระบบแก้ไขรูปภาพปิดชั่วคราว)</p>
          </div>
        </div>

        <IonItem lines="none" className="custom-input-item">
          <IonLabel position="stacked">ชื่อเมนูอาหาร</IonLabel>
          <IonInput 
            value={name} 
            placeholder="เช่น ข้าวผัดกะเพรา"
            onIonInput={(e) => setName(e.detail.value!)} 
          />
        </IonItem>

        <IonItem lines="none" className="custom-input-item">
          <IonLabel position="stacked">หมวดหมู่</IonLabel>
          <IonSelect 
            value={category} 
            placeholder="เลือกหมวดหมู่"
            onIonChange={(e) => setCategory(e.detail.value)}
          >
            <IonSelectOption value="esarn">อาหารอีสาน</IonSelectOption>
            <IonSelectOption value="thai">อาหารไทย</IonSelectOption>
            <IonSelectOption value="halal">อาหารฮาลาล</IonSelectOption>
            <IonSelectOption value="national">อาหารต่างชาติ</IonSelectOption>
          </IonSelect>
        </IonItem>

        <IonItem lines="none" className="custom-input-item">
          <IonLabel position="stacked">วัตถุดิบ</IonLabel>
          <IonTextarea 
            value={ingredients} 
            placeholder="ระบุวัตถุดิบ..."
            onIonInput={(e) => setIngredients(e.detail.value!)} 
            rows={4} 
          />
        </IonItem>

        <IonItem lines="none" className="custom-input-item">
          <IonLabel position="stacked">ขั้นตอนการทำ</IonLabel>
          <IonTextarea 
            value={steps} 
            placeholder="ระบุวิธีทำ..."
            onIonInput={(e) => setSteps(e.detail.value!)} 
            rows={6} 
          />
        </IonItem>

        <IonButton expand="block" onClick={handleUpdate} className="post-btn">บันทึกการแก้ไข</IonButton>
        
        <IonLoading isOpen={updating} message="กำลังบันทึกข้อมูลใหม่..." />
        <IonToast 
          isOpen={!!toastMsg} 
          message={toastMsg} 
          duration={2000} 
          onDidDismiss={() => setToastMsg('')} 
        />
      </IonContent>
    </IonPage>
  );
};

export default EditRecipe;