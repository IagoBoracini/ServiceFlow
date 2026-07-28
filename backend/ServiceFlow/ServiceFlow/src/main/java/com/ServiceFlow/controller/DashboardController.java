package com.serviceflow.controller;

import com.serviceflow.dto.DashboardResponse;
import com.serviceflow.service.DashboardService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(
            DashboardService dashboardService
    ) {
        this.dashboardService = dashboardService;
    }

    @GetMapping
    public DashboardResponse buscarDashboard(
            Authentication authentication
    ) {

        return dashboardService.buscarDashboard(
                authentication
        );
    }
}