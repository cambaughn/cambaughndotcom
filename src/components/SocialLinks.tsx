import Link from 'next/link';
import Image from 'next/image';
import styles from './SocialLinks.module.css';

export default function SocialLinks() {
  return (
    <div className={styles.socialLinks}>
      <Link href="https://x.com/cambaughn" target="_blank" rel="noopener noreferrer">
        <Image
          src="/icons/twitter.svg"
          alt="Twitter"
          width={20}
          height={20}
        />
      </Link>
      <Link href="https://www.linkedin.com/in/cambaughn/" target="_blank" rel="noopener noreferrer">
        <Image
          src="/icons/linkedin.svg"
          alt="LinkedIn"
          width={20}
          height={20}
        />
      </Link>
    </div>
  );
} 