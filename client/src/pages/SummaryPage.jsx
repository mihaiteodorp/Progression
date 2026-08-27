import ActivityGraph from "../components/ActivityGraph";
import GraphLegend from "../components/GraphLegend";
import styles from './SummaryPage.module.css';



export default function SummaryPage(){
    return (
        <div className={styles["summary-page"]}>
            <header className={styles["summary-header"]}>
                <h1>Summary</h1>

            </header>
            <div className={styles["dashboard-grid"]}>
                <section className={styles["dashboard-card"] +' '+ styles["workout-card"]}>
                    <div className={styles["workout-graph-wrapper"]}>
                        <h2>Workout activity</h2>
                        <ActivityGraph />
                        <GraphLegend/>

                    </div>

                </section>

            </div>
        </div>
    )
}