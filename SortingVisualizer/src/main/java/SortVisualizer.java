import javafx.application.Application;
import javafx.scene.Scene;
import javafx.scene.layout.Pane;
import javafx.stage.Stage;

public class SortVisualizer extends Application {

    @Override
    public void start(Stage primaryStage) {
        Pane root = new Pane();
        Scene scene = new Scene(root, 800, 600);

        primaryStage.setTitle("Sorting Algorithm Visualizer");
        primaryStage.setScene(scene);
        primaryStage.show();

        BubbleSortVisualizer bubbleSortVisualizer = new BubbleSortVisualizer(root, 800, 600);
        bubbleSortVisualizer.startSort();
    }

    public static void main(String[] args) {
        launch(args);
    }
}
