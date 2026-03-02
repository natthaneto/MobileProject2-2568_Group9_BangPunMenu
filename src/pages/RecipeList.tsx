import React, { useState, useEffect } from 'react';
import {
  IonContent, IonPage, IonHeader, IonToolbar, IonButtons, IonBackButton,
  IonTitle, IonSearchbar, IonSegment, IonSegmentButton, IonLabel, IonList,
  IonItem, IonThumbnail, IonLoading
} from '@ionic/react';
import { useLocation, useHistory } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import './RecipeList.css';

const RecipeList: React.FC = () => {
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchText, setSearchText] = useState('');
  
  const location = useLocation();
  const history = useHistory();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryFilter = params.get('category');
    if (categoryFilter) {
      setSelectedCategory(categoryFilter);
    } else {
      setSelectedCategory('all');
    }
  }, [location]);

  useEffect(() => {
    setLoading(true);
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
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRecipes(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [selectedCategory]);

  const filteredRecipes = recipes.filter(r => 
    r.name.toLowerCase().includes(searchText.toLowerCase())
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

        <IonLoading isOpen={loading} message="กำลังโหลดสูตรอาหาร..." />

        <IonList className="recipe-main-list">
          {filteredRecipes.length > 0 ? (
            filteredRecipes.map((item) => {
              // จัดการชื่อที่จะแสดงตรงนี้
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
          ) : (
            !loading && <div className="ion-padding ion-text-center">ไม่พบเมนูอาหารในหมวดนี้</div>
          )}
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default RecipeList;