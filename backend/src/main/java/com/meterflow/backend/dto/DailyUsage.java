package com.meterflow.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.Date;

@Data
@NoArgsConstructor
public class DailyUsage {
    private String date;
    private Long requests;

    public DailyUsage(Object date, Long requests) {
        this.date = (date != null) ? date.toString() : "";
        this.requests = requests;
    }
}
