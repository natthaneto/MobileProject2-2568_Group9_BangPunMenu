import React, { useState, useEffect } from 'react';
import {
  IonContent, IonPage, IonHeader, IonToolbar, IonButtons, IonBackButton,
  IonTitle, IonIcon, IonButton, IonSegment, IonSegmentButton, IonLabel,
  IonList, IonItem, IonThumbnail, IonAlert, IonLoading
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { trashOutline, createOutline, addOutline } from 'ionicons/icons';
import { auth, db } from '../firebaseConfig';
import { collection, query, where, onSnapshot, orderBy, doc, deleteDoc } from 'firebase/firestore';
import './PostSelection.css';

const PostSelection: React.FC = () => {
  const history = useHistory();
  const [segment, setSegment] = useState<'recipes' | 'feeds'>('recipes');
  const [myRecipes, setMyRecipes] = useState<any[]>([]);
  const [myFeeds, setMyFeeds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{id: string, type: 'recipes' | 'feeds'} | null>(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      history.replace('/login');
      return;
    }

    // 1. ดึงข้อมูลสูตรอาหาร (Real-time)
    const qRecipes = query(
      collection(db, "recipes"),
      where("authorId", "==", user.uid),
      orderBy("createdAt", "desc")
    );
    const unsubRecipes = onSnapshot(qRecipes, (snapshot) => {
      setMyRecipes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // 2. ดึงข้อมูลฟีดข่าว (Real-time)
    const qFeeds = query(
      collection(db, "feeds"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );
    const unsubFeeds = onSnapshot(qFeeds, (snapshot) => {
      setMyFeeds(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    return () => { unsubRecipes(); unsubFeeds(); };
  }, [history]);

  // ฟังก์ชันยืนยันการลบ
  const confirmDelete = (id: string, type: 'recipes' | 'feeds') => {
    setSelectedItem({ id, type });
    setShowAlert(true);
  };

  // ฟังก์ชันลบจริง
  const handleDelete = async () => {
    if (selectedItem) {
      try {
        await deleteDoc(doc(db, selectedItem.type, selectedItem.id));
        setSelectedItem(null);
      } catch (error) {
        console.error("Delete error:", error);
      }
    }
  };

  // ฟังก์ชันไปหน้าแก้ไข
  const handleEdit = (id: string) => {
    if (segment === 'recipes') {
      history.push(`/edit-recipe/${id}`);
    } else {
      history.push(`/edit-feed/${id}`);
    }
  };

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar className="post-selection-toolbar">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" text="" color="light" />
          </IonButtons>
          <IonTitle>จัดการโพสต์</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {/* ส่วนปุ่มสร้างโพสต์ใหม่ (สี่เหลี่ยมด้านบน) */}
        <div className="create-buttons-grid">
          <div className="square-card" onClick={() => history.push('/create-recipe')}>
            <IonIcon icon={addOutline} className="card-icon" />
            <span>สร้างสูตรอาหาร</span>
          </div>
          <div className="square-card" onClick={() => history.push('/create-feed')}>
            <IonIcon icon={addOutline} className="card-icon" />
            <span>สร้างโพสต์ฟีด</span>
          </div>
        </div>

        <div className="my-posts-header">
          <h3>โพสต์ของฉัน</h3>
        </div>

        {/* ส่วนเลือกหมวดหมู่ที่ต้องการจัดการ */}
        <IonSegment value={segment} onIonChange={(e) => setSegment(e.detail.value as any)} className="custom-segment">
          <IonSegmentButton value="recipes">
            <IonLabel>เมนูอาหาร ({myRecipes.length})</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="feeds">
            <IonLabel>ฟีดข่าว ({myFeeds.length})</IonLabel>
          </IonSegmentButton>
        </IonSegment>

        <IonLoading isOpen={loading} message="กำลังโหลดข้อมูลของคุณ..." />

        {/* รายการโพสต์ของเรา */}
        <IonList lines="full" className="my-items-list">
          {(segment === 'recipes' ? myRecipes : myFeeds).map((item) => (
            <IonItem key={item.id} className="manage-item">
              <IonThumbnail slot="start" className="manage-thumb">
                <img src={item.imageUrl || item.img || '/assets/2771401.png'} alt="thumb" />
              </IonThumbnail>
              
              <IonLabel>
                <h2 className="item-title">{item.name || item.title}</h2>
                <p className="item-subtitle">{item.category || (item.desc ? item.desc.substring(0, 30) + '...' : 'ไม่มีรายละเอียด')}</p>
              </IonLabel>

              <div slot="end" className="action-buttons">
                {/* ปุ่มแก้ไข */}
                <IonButton fill="clear" color="primary" onClick={() => handleEdit(item.id)}>
                  <IonIcon icon={createOutline} slot="icon-only" />
                </IonButton>
                
                {/* ปุ่มลบ */}
                <IonButton fill="clear" color="danger" onClick={() => confirmDelete(item.id, segment)}>
                  <IonIcon icon={trashOutline} slot="icon-only" />
                </IonButton>
              </div>
            </IonItem>
          ))}

          {/* กรณีไม่มีข้อมูล */}
          {!loading && (segment === 'recipes' ? myRecipes : myFeeds).length === 0 && (
            <div className="empty-state">
              <p>คุณยังไม่ได้สร้างโพสต์ในส่วนนี้</p>
            </div>
          )}
        </IonList>

        {/* แจ้งเตือนยืนยันการลบ */}
        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header={'ยืนยันการลบ'}
          message={'ข้อมูลนี้จะหายไปถาวร คุณแน่ใจหรือไม่?'}
          buttons={[
            { text: 'ยกเลิก', role: 'cancel' },
            { 
              text: 'ลบเลย', 
              handler: handleDelete,
              cssClass: 'alert-button-confirm'
            }
          ]}
        />
      </IonContent>
    </IonPage>
  );
};

export default PostSelection;