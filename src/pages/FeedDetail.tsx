import React, { useState, useEffect } from 'react';
import {
  IonContent, IonPage, IonHeader, IonToolbar, IonButtons, IonBackButton,
  IonTitle, IonIcon, IonButton, IonLoading, IonAvatar, IonNote
} from '@ionic/react';
import { heartOutline, heart, shareOutline, timeOutline } from 'ionicons/icons';
import { useParams } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import './FeedDetail.css';

const FeedDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      if (id) {
        const docRef = doc(db, "feeds", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setPost(docSnap.data());
        }
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  if (loading) return <IonLoading isOpen={loading} message="กำลังโหลดเนื้อหา..." />;

  // Logic ดึงชื่อ: ถ้าไม่มี userName ให้เอาหน้า @ จาก email
  const displayName = post?.userName || post?.userEmail?.split('@')[0] || 'สมาชิก';

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/feed" text="" color="dark" />
          </IonButtons>
          <IonTitle>รายละเอียดโพสต์</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {/* ส่วนหัวโพสต์: ชื่อผู้โพสต์ และเวลา */}
        <div className="feed-author-header">
          <IonAvatar className="feed-avatar">
            <img src={post?.userAvatar || "https://ionicframework.com/docs/img/demos/avatar.svg"} alt="avatar" />
          </IonAvatar>
          <div className="feed-author-info">
            <h3>{displayName}</h3>
            <p><IonIcon icon={timeOutline} /> เพิ่งเมื่อครู่</p>
          </div>
        </div>

        {/* รูปภาพประกอบโพสต์ */}
        <div className="feed-image-container">
          <img src={post?.img || "/assets/2771401.png"} alt="post" className="feed-detail-img" />
        </div>

        {/* เนื้อหาโพสต์ */}
        <div className="feed-text-content">
          <h1 className="feed-detail-title">{post?.title}</h1>
          <p className="feed-detail-desc">{post?.desc}</p>
        </div>

        
      </IonContent>
    </IonPage>
  );
};

export default FeedDetail;