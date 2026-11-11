package com.hostelsync.config;

import com.hostelsync.model.Role;
import com.hostelsync.model.Room;
import com.hostelsync.model.User;
import com.hostelsync.repository.RoomRepository;
import com.hostelsync.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

/** Creates demo staff accounts and rooms on first run. CHANGE THESE PASSWORDS before any real deployment. */
@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner seed(UserRepository users, RoomRepository rooms, PasswordEncoder encoder) {
        return args -> {
            if (!users.existsByEmail("warden@hostelsync.com")) {
                users.save(User.builder().name("Chief Warden").email("warden@hostelsync.com")
                        .password(encoder.encode("warden123")).role(Role.WARDEN).build());
            }
            if (!users.existsByEmail("tech@hostelsync.com")) {
                users.save(User.builder().name("Maintenance Technician").email("tech@hostelsync.com")
                        .password(encoder.encode("tech123")).role(Role.TECHNICIAN).build());
            }
            if (rooms.count() == 0) {
                for (int i = 101; i <= 110; i++) {
                    rooms.save(Room.builder().roomNumber("A-" + i).capacity(3).occupied(0).build());
                }
            }
        };
    }
}
