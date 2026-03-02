import React, { useState, useEffect } from 'react';
import {
  IonContent, IonPage, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
  IonItem, IonLabel, IonInput, IonTextarea, IonButton, IonLoading, IonToast
} from '@ionic/react';
import { db } from '../firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useHistory, useParams } from 'react-router-dom';
import './CreateRecipe.css';

const EditFeed: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    const fetchFeed = async () => {
      if (id) {
        const docRef = doc(db, "feeds", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setTitle(docSnap.data().title);
          setDesc(docSnap.data().desc);
        }
        setLoading(false);
      }
    };
    fetchFeed();
  }, [id]);

  const handleUpdate = async () => {
    if (!title.trim()) return;

    setUpdating(true);
    try {
      await updateDoc(doc(db, "feeds", id), {
        title: title.trim(),
        desc: desc
      });
      setUpdating(false);
      setToastMsg("แก้ไขโพสต์สำเร็จ!");
      setTimeout(() => history.goBack(), 1500);
    } catch (error: any) {
      setUpdating(false);
      setToastMsg("ข้อผิดพลาด: " + error.message);
    }
  };

  if (loading) return <IonLoading isOpen={loading} message="กำลังโหลด..." />;

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar className="create-recipe-toolbar">
          <IonButtons slot="start"><IonBackButton defaultHref="/post-selection" color="light" /></IonButtons>
          <IonTitle>แก้ไขโพสต์</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonItem lines="none" className="custom-input-item">
          <IonLabel position="stacked">หัวข้อโพสต์</IonLabel>
          <IonInput value={title} onIonInput={(e) => setTitle(e.detail.value!)} />
        </IonItem>
        <IonItem lines="none" className="custom-input-item">
          <IonLabel position="stacked">รายละเอียด</IonLabel>
          <IonTextarea value={desc} onIonInput={(e) => setDesc(e.detail.value!)} rows={8} />
        </IonItem>
        <IonButton expand="block" onClick={handleUpdate} className="post-btn">อัปเดตโพสต์</IonButton>
        <IonLoading isOpen={updating} message="กำลังอัปเดต..." />
        <IonToast isOpen={!!toastMsg} message={toastMsg} duration={2000} onDidDismiss={() => setToastMsg('')} />
      </IonContent>
    </IonPage>
  );
};
export default EditFeed;