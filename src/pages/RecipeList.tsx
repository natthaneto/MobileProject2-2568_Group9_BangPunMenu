import React, { useState, useEffect } from 'react';
import {
  IonContent, IonPage, IonHeader, IonToolbar, IonButtons, IonBackButton,
  IonTitle, IonSearchbar, IonSegment, IonSegmentButton, IonLabel, IonList,
  IonItem, IonThumbnail, IonLoading, IonIcon
} from '@ionic/react';
import { useLocation, useHistory } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { restaurantOutline, searchOutline } from 'ionicons/icons'; // เพิ่ม searchOutline ไว้เผื่อไม่มีผลค้นหา
import './RecipeList.css';

const RecipeList: React.FC = () => {
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchText, setSearchText] = useState('');
  
  const location = useLocation();
  const history = useHistory();

  // 1. จัดการ Category จาก URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryFilter = params.get('category');
    setSelectedCategory(categoryFilter || 'all');
  }, [location]);

  // 2. ดึงข้อมูล (เพิ่ม Error Handling และตรวจสอบค่าว่าง)
  useEffect(() => {
    setLoading(true);
    setRecipes([]); // ล้างข้อมูลเก่าออกก่อน เพื่อป้องกันข้อมูลข้ามหมวด
    
    let q;
    if (selectedCategory === 'all') {
      q = query(collection(db, "recipes"), orderBy("createdAt", "desc"));
    } else {
      q = query(
        collection(db, "recipes"), 
        where("category", "==", selectedCategory),
        orderBy("createdAt", "desc")
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        setRecipes([]);
      } else {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setRecipes(data);
      }
      setLoading(false); // มั่นใจว่าโหลดเสร็จแล้ว
    }, (error) => {
      console.error("Firestore Error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [selectedCategory]);

  // 3. กรองตามข้อความค้นหา
  const filteredRecipes = recipes.filter(r => 
    (r.name || "").toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar className="recipe-list-toolbar">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" text="" color="light" />
          </IonButtons>
          <IonTitle className="recipe-list-title">สูตรเมนูอาหาร</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <div className="search-container">
          <IonSearchbar 
            placeholder="ค้นหาเมนูอาหาร" 
            className="custom-searchbar"
            value={searchText}
            onIonInput={(e) => setSearchText(e.detail.value!)}
          />
        </div>

        <IonSegment 
          scrollable={true} 
          value={selectedCategory} 
          className="category-segment"
          onIonChange={(e) => setSelectedCategory(e.detail.value as string)}
        >
          <IonSegmentButton value="all"><IonLabel>ทั้งหมด</IonLabel></IonSegmentButton>
          <IonSegmentButton value="esarn"><IonLabel>อาหารอีสาน</IonLabel></IonSegmentButton>
          <IonSegmentButton value="thai"><IonLabel>อาหารไทย</IonLabel></IonSegmentButton>
          <IonSegmentButton value="halal"><IonLabel>อาหารฮาลาล</IonLabel></IonSegmentButton>
          <IonSegmentButton value="national"><IonLabel>อาหารต่างชาติ</IonLabel></IonSegmentButton>
        </IonSegment>

        {/* ปิด Loading เมื่อโหลดเสร็จ */}
        <IonLoading isOpen={loading} message="กำลังโหลด..." duration={3000} />

        <IonList className="recipe-main-list">
          {!loading && filteredRecipes.length > 0 ? (
            filteredRecipes.map((item) => {
              const authorName = item.authorName || item.authorEmail?.split('@')[0] || 'สมาชิก';
              return (
                <IonItem 
                  key={item.id} 
                  lines="full" 
                  className="recipe-list-item" 
                  button 
                  onClick={() => history.push(`/recipe-detail/${item.id}`)}
                >
                  <IonThumbnail slot="start" className="recipe-thumb">
                    <img src={item.imageUrl || '/assets/2771401.png'} alt={item.name} />
                  </IonThumbnail>
                  <IonLabel className="recipe-info">
                    <h2 className="recipe-name">{item.name}</h2>
                    <p className="recipe-author">โดย {authorName}</p>
                    <p className="recipe-views">ประเภท: {item.category}</p>
                  </IonLabel>
                </IonItem>
              );
            })
          ) : !loading && (
            // ส่วนนี้จะทำงานเมื่อ loading เป็น false และไม่มีข้อมูลใน List
            <div className="ion-padding ion-text-center" style={{ marginTop: '50px', color: '#888' }}>
              <IonIcon 
                icon={searchText ? searchOutline : restaurantOutline} 
                style={{ fontSize: '64px', opacity: '0.2' }} 
              />
              <h3 style={{ marginTop: '15px' }}>
                {searchText ? `ไม่พบ "${searchText}"` : 'ยังไม่มีเมนูในหมวดนี้'}
              </h3>
              <p>ลองเลือกหมวดหมู่อื่นดูนะครับ</p>
            </div>
          )}
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default RecipeList;