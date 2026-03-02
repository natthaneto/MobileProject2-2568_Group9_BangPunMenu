import React, { useState, useEffect } from 'react';
import {
  IonContent, IonPage, IonHeader, IonToolbar, IonTitle, IonSearchbar,
  IonSegment, IonSegmentButton, IonLabel, IonList, IonItem, IonThumbnail, 
  IonLoading, IonIcon
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { chatbubblesOutline, searchOutline } from 'ionicons/icons'; // เพิ่มไอคอน
import './Feed.css';

const Feed: React.FC = () => {
  const history = useHistory();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    setLoading(true);
    // ดึงข้อมูลจากคอลเลกชัน "feeds" เรียงตามเวลาล่าสุด
    const q = query(collection(db, "feeds"), orderBy("createdAt", "desc"));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      if (querySnapshot.empty) {
        setPosts([]);
      } else {
        const feedData: any[] = [];
        querySnapshot.forEach((doc) => {
          feedData.push({ id: doc.id, ...doc.data() });
        });
        setPosts(feedData);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching feeds: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // กรองโพสต์ตามข้อความค้นหา
  const filteredPosts = posts.filter(post => 
    (post.title || "").toLowerCase().includes(searchText.toLowerCase()) ||
    (post.desc || "").toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar className="feed-toolbar">
          <IonTitle className="feed-header-title">หน้าฟีดชุมชน</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        {/* ค้นหาในฟีด */}
        <div className="search-container">
          <IonSearchbar 
            placeholder="ค้นหาโพสต์ในฟีด..." 
            className="custom-searchbar"
            value={searchText}
            onIonInput={(e) => setSearchText(e.detail.value!)}
          ></IonSearchbar>
        </div>

        {/* Loading เฉพาะตอนโหลดครั้งแรก */}
        <IonLoading isOpen={loading} message="กำลังเปิดดูฟีด..." duration={3000} />

        <IonList className="feed-main-list">
          {!loading && filteredPosts.length > 0 ? (
            filteredPosts.map((post) => (
              <IonItem 
                key={post.id} 
                lines="full" 
                className="feed-post-item" 
                button 
                onClick={() => history.push(`/feed-detail/${post.id}`)}
              >
                <IonLabel className="post-content">
                  <h2 className="post-title">{post.title || "ไม่มีหัวข้อ"}</h2>
                  <p className="post-desc">{post.desc || "ไม่มีรายละเอียด"}</p>
                  <div className="post-meta">
                    <span className="post-author">โดย {post.userName || 'สมาชิก'}</span>
                    {/* แสดงจำนวนคอมเมนต์ถ้ามี หรือแสดงเวลาคร่าวๆ */}
                    <span className="post-date"> • {post.createdAt?.toDate().toLocaleDateString('th-TH') || 'เมื่อครู่'}</span>
                  </div>
                </IonLabel>
                <IonThumbnail slot="end" className="post-thumbnail-square">
                  <img 
                    src={post.imageUrl || post.img || '/assets/2771401.png'} 
                    alt="post"
                    onError={(e: any) => e.target.src = '/assets/2771401.png'} // กันภาพเสีย
                  />
                </IonThumbnail>
              </IonItem>
            ))
          ) : !loading && (
            // ส่วนแสดงผลเมื่อไม่มีโพสต์ (Empty State)
            <div className="ion-padding ion-text-center empty-feed">
              <IonIcon 
                icon={searchText ? searchOutline : chatbubblesOutline} 
                style={{ fontSize: '70px', opacity: '0.15', color: '#688049' }} 
              />
              <h3 style={{ color: '#688049', marginTop: '15px' }}>
                {searchText ? `ไม่พบโพสต์ที่เกี่ยวกับ "${searchText}"` : 'เงียบเหงาจัง...'}
              </h3>
              <p style={{ color: '#999' }}>
                {searchText ? 'ลองเปลี่ยนคำค้นหาดูนะ' : 'มาเป็นคนแรกที่โพสต์พูดคุยกันเถอะ!'}
              </p>
            </div>
          )}
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default Feed;