import React, { useState, useEffect } from "react";
import { Button, DatePicker, Radio, Select, Spin, Alert } from "antd";
import { useRouter } from "next/router";
import dayjs from "dayjs";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { getAuthToken } from "@/utils/constants";

const QUESTION_OPTIONS = [
  { value: "manager_helped_identify_problem", label: "Did the manager help you identify the problem properly?" },
  { value: "function_solved_problem", label: "Did the function solve the problem?" },
  { value: "manager_applied_feedback", label: "Did the Manager apply the feedback to help solve the problem?" },
];

export interface TrendDataPoint {
  date: string;
  Yes: number;
  No: number;
  "Yes/No": number;
  "No issue": number;
}

const chartMargin = { top: 8, right: 8, left: 0, bottom: 0 };
const xAxisProps = { dataKey: "date", tick: { fontSize: 10 } };
const yAxisProps = { domain: [0, 100] as [number, number], tick: { fontSize: 10 }, width: 28 };

const FunctionTrendsPage = () => {
  const router = useRouter();
  const [fromDate, setFromDate] = useState<dayjs.Dayjs | null>(null);
  const [toDate, setToDate] = useState<dayjs.Dayjs | null>(null);
  const [question, setQuestion] = useState(QUESTION_OPTIONS[0].value);
  const [selectYesNo, setSelectYesNo] = useState<"Yes" | "No">("Yes");
  const [chartData, setChartData] = useState<TrendDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrends = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      if (!token) {
        setError("Please log in to view trends.");
        setChartData([]);
        return;
      }
      const params = new URLSearchParams();
      params.set("question", question);
      if (fromDate?.isValid()) params.set("from", fromDate.format("YYYY-MM-DD"));
      if (toDate?.isValid()) params.set("to", toDate.format("YYYY-MM-DD"));
      const res = await fetch(`/api/ratings/trends?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setError(err?.error || "Failed to load trends");
        setChartData([]);
        return;
      }
      const json: { data: TrendDataPoint[] } = await res.json();
      setChartData(Array.isArray(json.data) ? json.data : []);
    } catch (e) {
      console.error("Fetch trends error:", e);
      setError("Failed to load trends");
      setChartData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrends();
  }, [question, fromDate?.valueOf(), toDate?.valueOf()]);

  const handleBack = () => router.push("/function-ratings");

  const handleGenerateXLR = () => {
    if (chartData.length === 0) return;
    const headers = ["Date", "Yes (%)", "No (%)", "Yes/No (%)", "No issue (%)"];
    const rows = chartData.map((d) => [d.date, d.Yes, d.No, d["Yes/No"], d["No issue"]].join(","));
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `function-trends-${question}-${dayjs().format("YYYY-MM-DD")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleNext = () => router.push("/function-ratings");

  return (
    <div className="w-full min-h-screen bg-white">
      <div
        className="w-full py-12 px-4 bg-gradient-to-r from-blue-600 to-blue-800 flex items-center justify-center relative overflow-hidden"
        style={{ minHeight: "160px" }}
      >
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-white blur-2xl" />
        </div>
        <h1 className="text-3xl md:text-4xl font-semibold text-white relative z-10">Function Trends</h1>
      </div>

      <div className="w-full max-w-6xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="flex flex-wrap items-end gap-4 mb-8 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
            <DatePicker
              format="DD/MM/YYYY"
              placeholder="DD/MM/YYYY"
              value={fromDate}
              onChange={(d) => setFromDate(d ?? null)}
              className="w-full min-w-[140px]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
            <DatePicker
              format="DD/MM/YYYY"
              placeholder="DD/MM/YYYY"
              value={toDate}
              onChange={(d) => setToDate(d ?? null)}
              className="w-full min-w-[140px]"
            />
          </div>
          <div className="min-w-[280px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Question</label>
            <Select
              value={question}
              onChange={setQuestion}
              options={QUESTION_OPTIONS}
              className="w-full"
              size="middle"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select</label>
            <Radio.Group value={selectYesNo} onChange={(e) => setSelectYesNo(e.target.value)} optionType="button" buttonStyle="solid">
              <Radio.Button value="Yes">Yes</Radio.Button>
              <Radio.Button value="No">No</Radio.Button>
            </Radio.Group>
          </div>
        </div>

        {error && (
          <Alert type="warning" message={error} className="mb-6" showIcon />
        )}

        {!loading && !error && chartData.length === 0 && (
          <Alert type="info" message="No trend data for the selected period. Try another date range or question." className="mb-6" showIcon />
        )}

        {/* Charts grid 3x3 */}
        <Spin spinning={loading} tip="Loading trends...">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {/* Row 1: Line charts */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <p className="text-sm font-medium text-gray-700 mb-2">Yes</p>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData} margin={chartMargin}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis {...xAxisProps} />
                <YAxis {...yAxisProps} />
                <Tooltip />
                <Line type="monotone" dataKey="Yes" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <p className="text-sm font-medium text-gray-700 mb-2">No</p>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData} margin={chartMargin}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis {...xAxisProps} />
                <YAxis {...yAxisProps} />
                <Tooltip />
                <Line type="monotone" dataKey="No" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <p className="text-sm font-medium text-gray-700 mb-2">Yes / No</p>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData} margin={chartMargin}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis {...xAxisProps} />
                <YAxis {...yAxisProps} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Yes" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="No" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          {/* Row 2: Bar charts */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <p className="text-sm font-medium text-gray-700 mb-2">Yes</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} margin={chartMargin}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis {...xAxisProps} />
                <YAxis {...yAxisProps} />
                <Tooltip />
                <Bar dataKey="Yes" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <p className="text-sm font-medium text-gray-700 mb-2">No</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} margin={chartMargin}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis {...xAxisProps} />
                <YAxis {...yAxisProps} />
                <Tooltip />
                <Bar dataKey="No" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <p className="text-sm font-medium text-gray-700 mb-2">Yes / No</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} margin={chartMargin}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis {...xAxisProps} />
                <YAxis {...yAxisProps} />
                <Tooltip />
                <Legend />
                <Bar dataKey="Yes" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="No" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* Row 3: Line Yes/No, No issue, Both */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <p className="text-sm font-medium text-gray-700 mb-2">Yes/No</p>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData} margin={chartMargin}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis {...xAxisProps} />
                <YAxis {...yAxisProps} />
                <Tooltip />
                <Line type="monotone" dataKey="Yes/No" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <p className="text-sm font-medium text-gray-700 mb-2">No issue</p>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData} margin={chartMargin}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis {...xAxisProps} />
                <YAxis {...yAxisProps} />
                <Tooltip />
                <Line type="monotone" dataKey="No issue" stroke="#eab308" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <p className="text-sm font-medium text-gray-700 mb-2">Yes/No & No issue</p>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData} margin={chartMargin}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis {...xAxisProps} />
                <YAxis {...yAxisProps} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Yes/No" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="No issue" stroke="#eab308" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        </Spin>

        {/* Actions */}
        <div className="flex flex-wrap justify-between items-center gap-4">
          <Button
            size="large"
            className="bg-white border border-primary text-primary hover:!bg-primary hover:!text-white hover:!border-primary"
            onClick={handleBack}
          >
            Back
          </Button>
          <div className="flex items-center gap-3">
            <Button
              size="large"
              className="bg-white border border-primary text-primary hover:!bg-primary hover:!text-white hover:!border-primary"
              onClick={handleGenerateXLR}
              disabled={chartData.length === 0}
            >
              Generate XLR
            </Button>
            <Button type="primary" size="large" className="bg-primary border-primary" onClick={handleNext}>
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FunctionTrendsPage;
