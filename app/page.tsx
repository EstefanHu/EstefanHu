import styles from "./page.module.css";

export default function Home() {
  return (
    <>
      <div className={styles.header}>
        <h1 className={styles.name}>j. <span>estefan</span> hu</h1>

        <p>
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://github.com/estefanhu/"
          >
            github.com/estefanhu
          </a>
          &nbsp;-&nbsp;
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://www.linkedin.com/in/estefanhu/"
          >
            linkedin.com/in/estefanhu
          </a>
          &nbsp;-&nbsp;
          <a target="_blank" rel="noopener noreferrer" href="/">
            estefanhu.com
          </a>
        </p>
      </div>

      <div className={styles.resumeWrapper}>
        <div className={styles.resumeNav}>
          <h2>Contents</h2>

          <div className={styles.section}>
            <a href="#experience">experience</a>
            <div className={styles.subLinks}>
              <a href="#microsoft">microsoft</a>
              <a href="#amazon">amazon</a>
              <a href="#adtech">adtech</a>
              <a href="#realestate">real estate</a>
              <a href="#social">social</a>
            </div>
            <a href="#technology">technology</a>
            <a href="#skills">skills</a>
            <a href="#education">education</a>
            <a href="#misc">misc</a>
            <div className={styles.subLinks}>
              <a href="#projects">projects</a>
              <a href="#reading">reading</a>
            </div>
          </div>
        </div>

        <div className={styles.resume}>
          <section id="experience" className={styles.experience}>
            <h3>experience</h3>

            <div id="microsoft">
              <h4>microsoft</h4>
              <div className={styles.info}>
                <span>
                  <h5>software engineer II</h5>
                  <p>redmond, wa</p>
                </span>

                <h5>Jan 2025 - Present</h5>
              </div>

              <p className={styles.headliner}>
                Contributed to the maintenance and security of Microsoft
                services supporting +300,000,000 monthly users
              </p>

              <ul>
                <li>
                  Designed and managed development of AI adoption initiatives,
                  increasing effectiveness and extensibility of existing
                  services.
                </li>
                <li>
                  Rolled out streamlined infra for auth leading to off boarding
                  of deprecated services.
                </li>
              </ul>
            </div>

            <div id="amazon">
              <h4>amazon</h4>

              <div className={styles.info}>
                <span>
                  <h5>software development engineer II</h5>
                  <p>seattle, wa</p>
                </span>

                <h5>Sep 2023 - Dec 2024</h5>
              </div>

              <p className={styles.headliner}>
                Spearheaded development on business critical services that
                impacts over 3,600,000,000 users annually.
              </p>

              <ul>
                <li>
                  Triaged critical analytics software, designing and developing
                  optimized solutions in Basic to reduce average query time by 3
                  seconds, saving over 4,000 hours or approximately $250,000 a
                  year
                </li>
                <li>
                  Lead overhaul of email pipelines in Java, improving
                  accessibility by 15% for 200 billion notifications annually
                </li>
                <li>
                  Upgraded 12 email template pipelines from Java to React and
                  Node, unifying development strategies
                </li>
                <li>
                  Spearheaded upgrade of s2s encryption ensuring traffic for
                  microservices, moving from HTTP to HTTPS
                </li>
              </ul>
            </div>

            <div id="adtech">
              <h4>Ad Tech</h4>

              <div className={styles.info}>
                <span>
                  <h5>software engineer</h5>
                  <p>New York, NY - Remote</p>
                </span>

                <h5>nov 2021 - jul 2023</h5>
              </div>

              <p className={styles.headliner}>
                Managed and led development of data capabilities hub, which
                established new standards for both Scientists and Engineers to
                collaborate on business critical deliverables.
              </p>

              <ul>
                <li>
                  Designed and delivered complete python infrastructure for the
                  Data Science and Analytics team. Enabling both Scientists and
                  Engineers to collaborate on business critical deliverables.
                </li>
                <li>
                  Spearheaded development of multiple microservices across
                  multiple teams, assuring ACIDity with our RESTful and GraphQL
                  distributed systems.
                </li>
                <li>
                  Launched and maintained open source tertiary React component
                  library, allowing for unified component styling across micro
                  front ends.
                </li>
                <li>
                  Developed, evangelized, and led adoption of machine to machine
                  encryption for microservices in the AWS VPC. By leveraging
                  Redis, Nginx, and JWT we secured our distributed systems and
                  ensured safed connections.
                </li>
                <li>
                  Contributed to high performing and dynamic teams to deliver
                  full stack solutions. Working hand in hand with end users to
                  deliver user led value in every scrum cycle.
                </li>
              </ul>
            </div>

            <div id="realestate">
              <h4>Real Estate</h4>

              <div className={styles.info}>
                <span>
                  <h5>junior software engineer</h5>
                  <p>Anchorage, AK- Remote</p>
                </span>

                <h5>apr 2020 - oct 2021</h5>
              </div>

              <p className={styles.headliner}>
                Designed, developed, and delivered multiple apps and services,
                working closely with designers, stakeholders, and end users to
                ship high velocity and battle tested solutions.
              </p>

              <ul>
                <li>
                  Architected and shipped solutions that interfaced with
                  multiple API's, such as Mapbox, MLS, and OAuth.
                </li>
                <li>
                  Lead Development of backends services, testing and
                  continuously deploying microservices and lambdas.
                </li>
                <li>
                  Designed and implemented caching infrastructure with Redis and
                  Golang.
                </li>
                <li>
                  Collaborated with designers to ship multi page marketing
                  website with React.
                </li>
                <li>
                  Ran User Research and managed stakeholder expectations using
                  figma, trello and slack.
                </li>
              </ul>
            </div>

            <div id="social">
              <h4>Social</h4>

              <div className={styles.info}>
                <span>
                  <h5>software engineer</h5>
                  <p>Seattle, Wa</p>
                </span>

                <h5>jan 2019 - jan 2020</h5>
              </div>

              <p className={styles.headliner}>
                Co-founded and managed technical functions of Angel funded
                University of Washington startup.
              </p>

              <ul>
                <li>
                  Directed product design, development, testing, and validation
                </li>
                <li>Lead interviewing and hiring for engineering roles</li>
              </ul>
            </div>
          </section>

          <section id="technology" className={styles.technology}>
            <h3>technology</h3>
            <p>
              <span>languages: </span>
              Go &#183; C# &#183; C++ &#183; Lua &#183; JavaScript &#183; Java
              &#183; Python &#183; BASIC &#183; PHP &#183; Bash &#183; Perl
              &#183; SQL &#183; Ruby
            </p>
            <p>
              <span>tools:</span>
              .NET &#183; React &#183; Node &#183; GraphQL &#183; FastAPI &#183;
              Spring Boot
            </p>
            <p>
              <span>databases:</span>
              Redshift &#183; PostgresSQL &#183; MySQL &#183; SQLite &#183;
              Redis &#183; MongoDB
            </p>
            <p>
              <span>cloud services:</span>
              Azure &#183; AWS &#183; Vercel &#183; Heroku &#183; Firebase
              &#183; Railway
            </p>
            <p>
              <span>devOps:</span>
              Docker &#183; Kubernetes &#183; Linux &#183; Git &#183; Github
              &#183; CirclCI &#183; Shell
            </p>
          </section>

          <section id="skills" className={styles.skills}>
            <h3>skill</h3>
            <ul>
              <li>Software Development</li>
            </ul>
          </section>

          <section id="education" className={styles.education}>
            <h3>education</h3>
            <div className={styles.education}>
              <h4>University of Washington, Seattle</h4>
            </div>
          </section>


          <section id="misc" className={styles.misc}>
            <h3>Misc</h3>
            <div id="projects">
              <h4>Projects</h4>
            </div>

            <div id="readingMi">
              <h4>Reading</h4>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
