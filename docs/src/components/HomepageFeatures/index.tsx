import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';
import Hands from '@site/static/img/hand.png';
import Sunny from '@site/static/img/sunny.png';
import InLove from '@site/static/img/in-love.png';

type FeatureItem = {
  title: string;
  imgUrl?: string;
  description: JSX.Element;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Hands on',
    imgUrl: Hands,
    description: (
      <>
        Learn with examples using docker compose
      </>
    ),
  },
  {
    title: 'Explicit',
    imgUrl: Sunny,
    description: (
      <>
        Written to be explicit about what to do
      </>
    ),
  },
  {
    title: 'Beginner friendly',
    imgUrl: InLove,
    description: (
      <>
        Weather you are new to docker, postgres or both!
      </>
    ),
  },
];

function Feature({title, imgUrl, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <img src={imgUrl} style={{maxWidth: '25%'}} />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
