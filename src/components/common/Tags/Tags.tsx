import Tag from './Tag';
import styles from './Tags.module.css';

interface TagsProps {
    tags: string[];
    activeTags: string[];
    toggleTag: (tag: string) => void;
    className?: string;
}

const Tags = ({ tags, activeTags, toggleTag, className }: TagsProps) => {
    return (
        <ul className={`${styles.tags} ${className}`}>
            {tags.map((tag, index) => (
                <Tag key={index} isActive={activeTags.includes(tag)} onClick={() => toggleTag(tag)}>
                    {tag}
                </Tag>
            ))}
        </ul>
    );
};

export default Tags;
