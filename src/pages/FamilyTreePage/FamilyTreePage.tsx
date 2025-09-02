import styles from './FamilyTreePage.module.css';
import FamilyTree from '@/components/FamilyTreePage/FamilyTree/FamilyTree';

const FamilyTreePage = () => {
    return (
        <div className={styles.familyTreePage}>
            <FamilyTree></FamilyTree>
        </div>
    );
};

export default FamilyTreePage;
