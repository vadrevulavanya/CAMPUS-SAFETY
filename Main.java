import java.util.*;

class Incident {
    int id;
    String title, category, priority, status;

    public Incident(int id, String title, String category, String desc) {
        this.id = id;
        this.title = title;
        this.category = category;
        this.status = "Pending";
        this.priority = classify(category, desc);
    }

    private String classify(String cat, String desc) {
        if (cat.equalsIgnoreCase("Fire") || desc.contains("fire")) return "High Priority";
        if (cat.equalsIgnoreCase("Theft")) return "Medium Priority";
        return "Low Priority";
    }
}

public class Main {
    public static void main(String[] args) {
        List<Incident> list = new ArrayList<>();
        list.add(new Incident(1, "Lab Smoke", "Fire", "Dense smoke near panel"));
        list.add(new Incident(2, "Lost Wallet", "Theft", "Stolen from canteen"));

        System.out.println("ID | Title | Category | Priority | Status");
        for (Incident i : list) {
            System.out.println(i.id + " | " + i.title + " | " + i.category + " | " + i.priority + " | " + i.status);
        }
    }
}