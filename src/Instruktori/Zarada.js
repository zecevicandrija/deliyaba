import React, { useEffect, useState, useCallback } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiCalendar, FiTrendingUp, FiUsers, FiDollarSign } from "react-icons/fi";
import { subDays, startOfMonth, startOfYear, format } from "date-fns";
import api from "../login/api";
import "./Zarada.css";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Zarada = () => {
  const navigate = useNavigate();
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);
  const [activeSubscriptions, setActiveSubscriptions] = useState(0);
  const [popularCourses, setPopularCourses] = useState([]);
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: subDays(new Date(), 30),
    endDate: new Date()
  });

  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      const formattedStart = format(dateRange.startDate, 'yyyy-MM-dd');
      const formattedEnd = format(dateRange.endDate, 'yyyy-MM-dd');

      // Fetch multiple metrics in parallel
      const [zaradaRes, korisniciRes, popularityRes] = await Promise.all([
        api.get(`/api/kupovina/zarada-po-danu?startDate=${formattedStart}&endDate=${formattedEnd}`),
        api.get("/api/korisnici"),
        api.get("/api/kupovina/popularity")
      ]);

      // Process Revenue Data
      const earningsBackend = zaradaRes.data;
      if (earningsBackend) {
        const labels = earningsBackend.map((item) =>
          new Date(item.dan).toLocaleDateString("sr-RS", { day: '2-digit', month: '2-digit' })
        );
        const earningsData = earningsBackend.map((item) => item.dnevna_zarada);

        const total = earningsData.reduce((acc, curr) => acc + Number(curr), 0);
        setTotalEarnings(total);

        setChartData({
          labels,
          datasets: [
            {
              label: "Dnevni prihod (€)",
              data: earningsData,
              borderColor: "#0047AB",
              backgroundColor: "rgba(0, 71, 171, 0.05)",
              fill: true,
              tension: 0.4,
              pointBackgroundColor: "#0047AB",
              pointBorderColor: "#fff",
              pointHoverRadius: 8,
              pointRadius: 4,
              borderWidth: 3,
            },
          ],
        });
      }

      // Process User Data
      if (korisniciRes.data) {
        setTotalStudents(korisniciRes.data.length);
        const active = korisniciRes.data.filter(u => u.subscription_status === 'active').length;
        setActiveSubscriptions(active);
      }

      // Process Course Popularity
      if (popularityRes.data) {
        setPopularCourses(popularityRes.data.sort((a, b) => b.broj_kupovina - a.broj_kupovina).slice(0, 5));
      }

    } catch (error) {
      console.error("Greška pri dohvatanju podataka:", error);
    } finally {
      setIsLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handlePresetRange = (period) => {
    const end = new Date();
    let start;
    switch (period) {
      case '7d': start = subDays(end, 7); break;
      case '30d': start = subDays(end, 30); break;
      case '6m': start = startOfMonth(subDays(end, 180)); break;
      case '1y': start = startOfYear(new Date()); break;
      default: start = subDays(end, 30);
    }
    setDateRange({ startDate: start, endDate: end });
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#111827",
        titleFont: { family: "Clash Display", size: 14, weight: '700' },
        bodyFont: { family: "Montserrat", size: 13 },
        padding: 12,
        borderColor: "rgba(255, 255, 255, 0.1)",
        borderWidth: 1,
        displayColors: false,
        cornerRadius: 0
      }
    },
    scales: {
      x: {
        ticks: {
          color: "#4B5563",
          font: { family: "Montserrat", size: 11, weight: '600' }
        },
        grid: { display: false },
      },
      y: {
        ticks: {
          color: "#4B5563",
          font: { family: "Montserrat", size: 11, weight: '600' },
          callback: (value) => `${value}€`
        },
        grid: { color: "rgba(0, 0, 0, 0.05)" },
      },
    },
  };

  return (
    <div className="za-full-page-container">
      <div className="za-noise-overlay"></div>
      <div className="za-grid-overlay"></div>

      <div className="za-zarada-inner">
        {/* Top Header */}
        <div className="za-top-nav">
          <button onClick={() => navigate('/instruktor')} className="za-back-btn">
            <FiArrowLeft /> <span>NAZAD NA DASHBOARD</span>
          </button>
          <div className="za-page-title-box">
            <span className="za-badge">ANALYTICS ENGINE</span>
            <h1 className="za-main-title">ZARADA SISTEMA</h1>
          </div>
        </div>

        {/* Global Filter Bar */}
        <div className="za-filter-wrapper za-glass-panel">
          <div className="za-date-selection">
            <div className="za-picker-box">
              <FiCalendar />
              <input
                type="date"
                value={format(dateRange.startDate, 'yyyy-MM-dd')}
                onChange={e => setDateRange({ ...dateRange, startDate: new Date(e.target.value) })}
                className="za-date-input"
              />
            </div>
            <span className="za-to-separator">DO</span>
            <div className="za-picker-box">
              <FiCalendar />
              <input
                type="date"
                value={format(dateRange.endDate, 'yyyy-MM-dd')}
                onChange={e => setDateRange({ ...dateRange, endDate: new Date(e.target.value) })}
                className="za-date-input"
              />
            </div>
          </div>
          <div className="za-presets">
            <button onClick={() => handlePresetRange('7d')} className={format(dateRange.startDate, 'yyyy-MM-dd') === format(subDays(new Date(), 7), 'yyyy-MM-dd') ? "za-preset-btn active" : "za-preset-btn"}>7D</button>
            <button onClick={() => handlePresetRange('30d')} className={format(dateRange.startDate, 'yyyy-MM-dd') === format(subDays(new Date(), 30), 'yyyy-MM-dd') ? "za-preset-btn active" : "za-preset-btn"}>30D</button>
            <button onClick={() => handlePresetRange('6m')} className="za-preset-btn">6M</button>
            <button onClick={() => handlePresetRange('1y')} className="za-preset-btn">YTD</button>
          </div>
        </div>

        {/* Stat Cards Grid */}
        <div className="za-stats-grid">
          <div className="za-stat-card za-glass-panel">
            <div className="za-stat-icon earnings-icon"><FiDollarSign /></div>
            <div className="za-stat-info">
              <span className="za-stat-label">PRIHOD U PERIODU</span>
              <h4 className="za-stat-value">{totalEarnings.toLocaleString()} €</h4>
            </div>
            <div className="za-stat-trend positive"><FiTrendingUp /> PRODAJA</div>
          </div>

          <div className="za-stat-card za-glass-panel">
            <div className="za-stat-icon students-icon"><FiUsers /></div>
            <div className="za-stat-info">
              <span className="za-stat-label">STUDENTI</span>
              <h4 className="za-stat-value">{totalStudents}</h4>
            </div>
            <div className="za-stat-trend positive">{activeSubscriptions} AKTIVNIH</div>
          </div>
        </div>

        {/* Dynamic Content Grid */}
        <div className="za-main-dashboard-grid">
          <div className="za-content-main za-glass-panel">
            <div className="za-header-row">
              <div className="za-title-group">
                <h3 className="za-section-title">TREND PRIHODA</h3>
                <p className="za-section-desc">Vizuelna reprezentacija rasta u izabranom periodu</p>
              </div>
            </div>

            <div className="za-chart-full-container">
              {isLoading ? (
                <div className="za-loader">Sinhronizacija podataka...</div>
              ) : chartData.labels.length > 0 ? (
                <Line data={chartData} options={chartOptions} />
              ) : (
                <div className="za-no-data">Nema podataka za ovaj opseg.</div>
              )}
            </div>
          </div>

          <div className="za-popular-courses za-glass-panel">
            <h3 className="za-section-title">TOP PROIZVODI</h3>
            <div className="za-courses-table">
              {popularCourses.map((course, idx) => (
                <div key={course.kurs_id} className="za-course-row">
                  <span className="za-course-rank">#{idx + 1}</span>
                  <div className="za-course-name-box">
                    <span className="za-course-name">{course.kurs_naziv}</span>
                    <span className="za-course-price">{course.broj_kupovina} prodaja</span>
                  </div>
                </div>
              ))}
              {popularCourses.length === 0 && <p className="za-no-data">Nema podataka.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Zarada;
