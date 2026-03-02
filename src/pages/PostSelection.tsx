import React, { useState, useEffect } from 'react';
import {
  IonContent, IonPage, IonHeader, IonToolbar, IonButtons, IonBackButton,
  IonTitle, IonIcon, IonButton, IonSegment, IonSegmentButton, IonLabel,
  IonList, IonItem, IonThumbnail, IonAlert, IonLoading
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { trashOutline, createOutline, addOutline, documentTextOutline, chatbubblesOutline } from 'ionicons/icons';
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

    setLoading(true);

    // 1. ตั้งค่า Query สำหรับ Recipes
    const qRecipes = query(
      collection(db, "recipes"),
      where("authorId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    // 2. ตั้งค่า Query สำหรับ Feeds
    const qFeeds = query(
      collection(db, "feeds"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    // เริ่มต้นติดตามข้อมูล (Real-time)
    // ใช้ตัวแปรเพื่อเช็คว่าโหลดข้อมูลครั้งแรกเสร็จหรือยัง
    let recipesLoaded = false;
    let feedsLoaded = false;

    const unsubRecipes = onSnapshot(qRecipes, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMyRecipes(data);
      recipesLoaded = true;
      if (recipesLoaded && feedsLoaded) setLoading(false);
    }, (err) => {
      console.error("Recipe Error:", err);
      setLoading(false);
    });

    const unsubFeeds = onSnapshot(qFeeds, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMyFeeds(data);
      feedsLoaded = true;
      if (recipesLoaded && feedsLoaded) setLoading(false);
    }, (err) => {
      console.error("Feed Error:", err);
      setLoading(false);
    });

    // สำคัญ: คืนค่าฟังก์ชันเพื่อ Unsubscribe เมื่อ Component ถูกทำลาย (ป้องกัน Error Internal)
    return () => {
      unsubRecipes();
      unsubFeeds();
    };
  }, [history]); // เอา segment ออกจากตรงนี้ เพื่อไม่ให้มัน Re-run ทุกครั้งที่กดสลับแท็บ

  const confirmDelete = (id: string, type: 'recipes' | 'feeds') => {
    setSelectedItem({ id, type });
    setShowAlert(true);
  };

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

  const handleEdit = (id: string) => {
    if (segment === 'recipes') {
      history.push(`/edit-recipe/${id}`);
    } else {
      history.push(`/edit-feed/${id}`);
    }
  };

  // เลือกรายการที่จะแสดง
  const currentItems = segment === 'recipes' ? myRecipes : myFeeds;

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
        {/* ส่วนปุ่มสร้างโพสต์ใหม่ */}
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

        <IonSegment value={segment} onIonChange={(e) => setSegment(e.detail.value as any)} className="custom-segment">
          <IonSegmentButton value="recipes">
            <IonLabel>เมนูอาหาร ({myRecipes.length})</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="feeds">
            <IonLabel>ฟีดข่าว ({myFeeds.length})</IonLabel>
          </IonSegmentButton>
        </IonSegment>

        {/* Loading เฉพาะตอนเปิดหน้าครั้งแรก */}
        <IonLoading isOpen={loading} message="กำลังเรียกดูข้อมูล..." duration={3000} />

        <IonList lines="full" className="my-items-list">
          {!loading && currentItems.length > 0 ? (
            currentItems.map((item) => (
              <IonItem key={item.id} className="manage-item">
                <IonThumbnail slot="start" className="manage-thumb">
                  <img 
                    src={item.imageUrl || item.img || '/assets/2771401.png'} 
                    alt="thumb" 
                    onError={(e: any) => e.target.src='/assets/2771401.png'} 
                  />
                </IonThumbnail>
                
                <IonLabel>
                  <h2 className="item-title">{item.name || item.title}</h2>
                  <p className="item-subtitle">
                    {item.category || (item.desc ? item.desc.substring(0, 30) + '...' : 'ไม่มีรายละเอียด')}
                  </p>
                </IonLabel>

                <div slot="end" className="action-buttons">
                  <IonButton fill="clear" color="primary" onClick={() => handleEdit(item.id)}>
                    <IonIcon icon={createOutline} slot="icon-only" />
                  </IonButton>
                  <IonButton fill="clear" color="danger" onClick={() => confirmDelete(item.id, segment)}>
                    <IonIcon icon={trashOutline} slot="icon-only" />
                  </IonButton>
                </div>
              </IonItem>
            ))
          ) : !loading && (
            /* กรณีไม่มีโพสต์ (Empty State) */
            <div className="ion-padding ion-text-center" style={{ marginTop: '50px', color: '#999' }}>
              <IonIcon 
                icon={segment === 'recipes' ? documentTextOutline : chatbubblesOutline} 
                style={{ fontSize: '72px', opacity: '0.15' }} 
              />
              <h3 style={{ marginTop: '20px' }}>ยังไม่มี{segment === 'recipes' ? 'สูตรอาหาร' : 'โพสต์ฟีด'}ของคุณ</h3>
              <p>เริ่มสร้างโพสต์เพื่อแบ่งปันเมนูอร่อยๆ กันเลย!</p>
            </div>
          )}
        </IonList>

        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header={'ยืนยันการลบ'}
          message={'ข้อมูลนี้จะหายไปถาวร คุณแน่ใจหรือไม่?'}
          buttons={[
            { text: 'ยกเลิก', role: 'cancel' },
            { text: 'ลบเลย', handler: handleDelete, cssClass: 'danger-text' }
          ]}
        />
      </IonContent>
    </IonPage>
  );
};

export default PostSelection;