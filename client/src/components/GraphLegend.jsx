import styles from './GraphLegend.module.css'

export default function GraphLegend(){

    return (
        <div className={styles["graph-legend"]}>
            <span>Less</span>
            <div className={styles["legend-squares"]}>
                <div className={styles['legend-square']+' '+ styles['intensity-0']}></div>
                <div className={styles['legend-square']+' '+ styles['intensity-1']}></div>
                <div className={styles['legend-square']+' '+ styles['intensity-2']}></div>
                <div className={styles['legend-square']+' '+ styles['intensity-3']}></div>
                <div className={styles['legend-square']+' '+ styles['intensity-4']}></div>
                <div className={styles['legend-square']+' '+ styles['intensity-5']}></div>
            </div>
            <span>More</span>
        </div>
    )
}