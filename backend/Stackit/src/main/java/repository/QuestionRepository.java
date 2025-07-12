package repository;

import Entity.Profile;
import Entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface QuestionRepository extends JpaRepository<Question, UUID> {

    List<Question> findByAuthor(Profile author);
    List<Question> findByTagsContaining(String tag);
}