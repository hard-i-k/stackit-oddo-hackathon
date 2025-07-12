package repository;


import Entity.Answer;
import Entity.Profile;
import Entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AnswerRepository extends JpaRepository<Answer, UUID> {

    List<Answer> findByAuthor(Profile author);
    List<Answer> findByQuestion(Question question);
}