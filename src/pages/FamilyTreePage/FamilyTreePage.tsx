import FamilyTree from '@/components/FamilyTreePage/FamilyTree/FamilyTree';
import styles from './FamilyTreePage.module.css';

const FamilyTreePage = () => {
    return (
        <div className={styles.familyTreePage}>
            <FamilyTree></FamilyTree>
        </div>
    );
};

export default FamilyTreePage;
