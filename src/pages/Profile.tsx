import React, { useState, useEffect } from 'react';
import {
  IonContent, IonPage, IonHeader, IonToolbar, IonTitle, IonList, IonItem, 
  IonLabel, IonIcon, IonAvatar, IonLoading, IonToggle, IonButtons, IonButton
} from '@ionic/react';
import { personOutline, logOutOutline, chevronForwardOutline, logInOutline } from 'ionicons/icons';
import { useHistory, useLocation } from 'react-router-dom';
import { auth, db } from '../firebaseConfig';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import './Profile.css';

const Profile: React.FC = () => {
  const history = useHistory();
  const location = useLocation();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async (uid: string) => {
    try {
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        setUserData(userDoc.data());
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchUserData(user.uid);
      } else {
        // ถ้าไม่ได้ Login ให้เคลียร์ข้อมูลเดิมและหยุดโหลด (ไม่ Redirect)
        setUserData(null);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [location]); // ทำงานใหม่เมื่อกลับมาหน้านี้

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // ไม่ต้อง replace เพราะ onAuthStateChanged จะจัดการเปลี่ยน UI ให้เอง
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <IonLoading isOpen={true} message="กำลังโหลด..." duration={3000} onDidDismiss={() => setLoading(false)} />;

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonTitle>โปรไฟล์</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <div className="profile-header-section">
          <IonAvatar className="user-large-avatar">
            <img 
              src={userData?.profileImage || "https://ionicframework.com/docs/img/demos/avatar.svg"} 
              alt="User Profile" 
              onError={(e: any) => { e.target.src = "https://ionicframework.com/docs/img/demos/avatar.svg" }}
            />
          </IonAvatar>
          <div className="user-info-text">
            {/* เช็คสถานะการ Login เพื่อแสดงชื่อ */}
            <h2>{auth.currentUser ? (userData?.name || "กำลังโหลด...") : "ผู้เยี่ยมชม (Guest)"}</h2>
            <p>{auth.currentUser ? (userData?.email || auth.currentUser?.email) : "กรุณาเข้าสู่ระบบเพื่อใช้งาน"}</p>
          </div>
        </div>

        <IonList lines="full" className="profile-menu-list">
          
          {/* ซ่อนเมนูแก้ไขโปรไฟล์ถ้าไม่ได้ Login (หรือจะให้กดแล้วไปหน้า Login ก็ได้) */}
          {auth.currentUser && (
            <IonItem button detail={false} className="profile-item" onClick={() => history.push('/edit-profile')}>
              <IonIcon icon={personOutline} slot="start" />
              <IonLabel>แก้ไขโปรไฟล์</IonLabel>
              <IonIcon icon={chevronForwardOutline} slot="end" color="medium" />
            </IonItem>
          )}

          {/* สลับปุ่มระหว่าง ออกจากระบบ กับ เข้าสู่ระบบ */}
          {auth.currentUser ? (
            <IonItem button onClick={handleLogout} className="logout-item">
              <IonIcon icon={logOutOutline} slot="start" color="danger" />
              <IonLabel color="danger">ออกจากระบบ</IonLabel>
            </IonItem>
          ) : (
            <IonItem button onClick={() => history.push('/login')} className="login-item">
              <IonIcon icon={logInOutline} slot="start" color="success" />
              <IonLabel color="success">เข้าสู่ระบบ</IonLabel>
            </IonItem>
          )}

        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default Profile;