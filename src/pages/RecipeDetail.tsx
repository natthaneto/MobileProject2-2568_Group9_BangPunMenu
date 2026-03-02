import React, { useState, useEffect } from 'react';
import {
  IonContent, IonPage, IonHeader, IonToolbar, IonButtons, IonBackButton,
  IonTitle, IonIcon, IonButton, IonLoading, IonAvatar
} from '@ionic/react';
import { heartOutline, heart, shareOutline } from 'ionicons/icons';
import { useParams } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import './RecipeDetail.css';

const RecipeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [recipe, setRecipe] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    const fetchRecipe = async () => {
      if (id) {
        const docRef = doc(db, "recipes", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setRecipe(docSnap.data());
        }
        setLoading(false);
      }
    };
    fetchRecipe();
  }, [id]);

  if (loading) return <IonLoading isOpen={loading} message="กำลังโหลดสูตรอาหาร..." />;

  // Logic สำหรับดึงชื่อ: ถ้าไม่มี authorName ให้เอาชื่อหน้า @ จาก authorEmail
  const displayName = recipe?.authorName || recipe?.authorEmail?.split('@')[0] || 'สมาชิก';

  return (
    <IonPage>
      <IonContent fullscreen>
        <div className="header-container">
          <IonButtons slot="start" className="back-btn-overlay">
            <IonBackButton defaultHref="/recipes" text="" color="light" />
          </IonButtons>
          <img src={recipe?.imageUrl || '/assets/2771401.png'} alt={recipe?.name} className="main-recipe-img" />
          <div className="header-overlay">
            <h1>{recipe?.name}</h1>
            <p>{recipe?.category === 'esarn' ? 'อาหารอีสาน' : recipe?.category}</p>
          </div>
        </div>

        <div className="recipe-content">
          <div className="author-section">
            <IonAvatar className="author-avatar">
              <img src="https://ionicframework.com/docs/img/demos/avatar.svg" alt="author" />
            </IonAvatar>
            <div className="author-info">
              {/* แสดงชื่อที่เราจัดการ Logic ไว้ด้านบน */}
              <h3>{displayName}</h3>
            </div>
          </div>

          <h2 className="section-title">วัตถุดิบ</h2>
          <div className="ingredients-grid">
             <pre className="ingredients-text">{recipe?.ingredients}</pre>
          </div>

          <hr className="divider" />

          <h2 className="section-title">ขั้นตอนการทำ</h2>
          <div className="steps-container">
            <pre className="steps-text">{recipe?.steps}</pre>
          </div>

          <div className="interaction-bar">
            <IonButton fill="clear" onClick={() => setIsLiked(!isLiked)} color={isLiked ? "danger" : "dark"}>
              <IonIcon icon={isLiked ? heart : heartOutline} slot="icon-only" />
            </IonButton>
            <IonButton fill="clear" color="dark">
              <IonIcon icon={shareOutline} slot="icon-only" />
            </IonButton>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default RecipeDetail;