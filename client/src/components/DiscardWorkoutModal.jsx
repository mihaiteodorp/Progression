import styles from './DiscardWorkoutModal.module.css';

export default function DiscardWorkoutModal({
    onClose,
    onDiscard
}) {

    return (
        <div
            className={styles.modalOverlay}
        >
            <section
                className={styles.modalCard}
                role="dialog"
                aria-modal="true"
                aria-labelledby="discard-workout-title"
            >

                <button
                    type="button"
                    className={styles.closeButton}
                    aria-label="Close discard workout dialog"
                    title="Close"
                    onClick={onClose}
                >
                    ×
                </button>


                <h2
                    id="discard-workout-title"
                    className={styles.modalTitle}
                >
                    Discard workout?
                </h2>


                <p
                    className={styles.modalDescription}
                >
                    Your exercises and sets from this workout will be lost.
                </p>


                <div
                    className={styles.modalActions}
                >
                    <button
                        type="button"
                        className={styles.keepButton}
                        onClick={onClose}
                    >
                        Keep workout
                    </button>

                    <button
                        type="button"
                        className={styles.discardButton}
                        onClick={onDiscard}
                    >
                        Discard
                    </button>
                </div>

            </section>
        </div>
    );
}