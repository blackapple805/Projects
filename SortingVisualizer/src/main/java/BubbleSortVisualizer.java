import javafx.animation.KeyFrame;
import javafx.animation.Timeline;
import javafx.scene.layout.Pane;
import javafx.scene.paint.Color;
import javafx.scene.shape.Rectangle;
import javafx.util.Duration;

public class BubbleSortVisualizer {
    private final Pane pane;
    private final int width;
    private final int height;
    private final int barCount = 50;
    private final int[] array;
    private final Rectangle[] bars;

    public BubbleSortVisualizer(Pane pane, int width, int height) {
        this.pane = pane;
        this.width = width;
        this.height = height;
        this.array = new int[barCount];
        this.bars = new Rectangle[barCount];
        initializeArray();
        initializeBars();
    }

    private void initializeArray() {
        for (int i = 0; i < barCount; i++) {
            array[i] = (int) (Math.random() * height);
        }
    }

    private void initializeBars() {
        for (int i = 0; i < barCount; i++) {
            bars[i] = new Rectangle((double) width / barCount - 2, array[i]);
            bars[i].setX(i * (double) width / barCount);
            bars[i].setY(height - array[i]);
            bars[i].setFill(Color.BLUE);
            pane.getChildren().add(bars[i]);
        }
    }

    public void startSort() {
        Timeline timeline = new Timeline();
        for (int i = 0; i < array.length - 1; i++) {
            for (int j = 0; j < array.length - 1 - i; j++) {
                int finalJ = j;
                timeline.getKeyFrames().add(new KeyFrame(Duration.millis(50 * (i * array.length + j)),
                        e -> {
                            if (array[finalJ] > array[finalJ + 1]) {
                                swap(finalJ, finalJ + 1);
                            }
                        }));
            }
        }
        timeline.play();
    }

    private void swap(int i, int j) {
        int temp = array[i];
        array[i] = array[j];
        array[j] = temp;

        double tempHeight = bars[i].getHeight();
        bars[i].setHeight(bars[j].getHeight());
        bars[i].setY(height - bars[i].getHeight());
        bars[j].setHeight(tempHeight);
        bars[j].setY(height - bars[j].getHeight());
    }
}
