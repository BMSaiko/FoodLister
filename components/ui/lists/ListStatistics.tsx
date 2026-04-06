"use client";

import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  MapPin,
  Star,
  CheckCircle2,
  XCircle,
  UtensilsCrossed,
} from "lucide-react";

interface CuisineType {
  id: string;
  name: string;
  icon?: string;
}

interface Restaurant {
  id: string;
  name: string;
  rating?: number;
  price_per_person?: number;
  location?: string;
  visited: boolean;
  cuisine_types: CuisineType[];
}

interface ListStatisticsProps {
  restaurants: Restaurant[];
}

const COLORS = ["#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ef4444", "#ec4899", "#f97316", "#14b8a6"];

const getPriceLevel = (price?: number): string => {
  if (!price) return "€";
  if (price < 15) return "€";
  if (price < 30) return "€€";
  if (price < 50) return "€€€";
  return "€€€€";
};

export default function ListStatistics({ restaurants }: ListStatisticsProps) {
  if (!restaurants || restaurants.length === 0) {
    return null;
  }

  // Total count
  const total = restaurants.length;

  // Average rating
  const ratedRestaurants = restaurants.filter((r) => r.rating != null && r.rating > 0);
  const avgRating =
    ratedRestaurants.length > 0
      ? ratedRestaurants.reduce((sum, r) => sum + (r.rating || 0), 0) / ratedRestaurants.length
      : 0;

  // Visited vs unvisited
  const visitedCount = restaurants.filter((r) => r.visited).length;
  const unvisitedCount = total - visitedCount;

  // Cuisine type distribution
  const cuisineCount: Record<string, number> = {};
  restaurants.forEach((r) => {
    r.cuisine_types?.forEach((ct) => {
      const name = ct.name || "Outro";
      cuisineCount[name] = (cuisineCount[name] || 0) + 1;
    });
  });
  const cuisineData = Object.entries(cuisineCount)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  // Price range distribution
  const priceCount: Record<string, number> = { "€": 0, "€€": 0, "€€€": 0, "€€€€": 0 };
  restaurants.forEach((r) => {
    const level = getPriceLevel(r.price_per_person);
    priceCount[level] = (priceCount[level] || 0) + 1;
  });
  const priceData = Object.entries(priceCount)
    .map(([name, value]) => ({ name, value }))
    .filter((d) => d.value > 0);

  return (
    <div className="space-y-6">
      {/* Top Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Restaurants */}
        <div className="bg-white rounded-xl shadow-md p-4 text-center">
          <div className="flex items-center justify-center w-10 h-10 mx-auto mb-2 bg-amber-100 rounded-full">
            <UtensilsCrossed className="h-5 w-5 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{total}</p>
          <p className="text-xs text-gray-500">Restaurantes</p>
        </div>

        {/* Average Rating */}
        <div className="bg-white rounded-xl shadow-md p-4 text-center">
          <div className="flex items-center justify-center w-10 h-10 mx-auto mb-2 bg-yellow-100 rounded-full">
            <Star className="h-5 w-5 text-yellow-600" fill="currentColor" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {avgRating > 0 ? avgRating.toFixed(1) : "N/A"}
          </p>
          <p className="text-xs text-gray-500">Rating Médio</p>
        </div>

        {/* Visited */}
        <div className="bg-white rounded-xl shadow-md p-4 text-center">
          <div className="flex items-center justify-center w-10 h-10 mx-auto mb-2 bg-green-100 rounded-full">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{visitedCount}</p>
          <p className="text-xs text-gray-500">Visitados</p>
        </div>

        {/* Unvisited */}
        <div className="bg-white rounded-xl shadow-md p-4 text-center">
          <div className="flex items-center justify-center w-10 h-10 mx-auto mb-2 bg-blue-100 rounded-full">
            <XCircle className="h-5 w-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{unvisitedCount}</p>
          <p className="text-xs text-gray-500">Por Visitar</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cuisine Type Distribution */}
        {cuisineData.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-amber-500" />
              Tipos de Cozinha
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={cuisineData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {cuisineData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Price Range Distribution */}
        {priceData.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-amber-500">€</span>
              Faixa de Preços
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={priceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {priceData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Visited Progress Bar */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Progresso de Visitas</h3>
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <div
            className="bg-gradient-to-r from-green-400 to-green-600 h-4 rounded-full transition-all duration-500"
            style={{ width: `${total > 0 ? (visitedCount / total) * 100 : 0}%` }}
          />
        </div>
        <p className="text-sm text-gray-500 mt-2 text-center">
          {total > 0 ? Math.round((visitedCount / total) * 100) : 0}% visitado ({visitedCount} de {total})
        </p>
      </div>
    </div>
  );
}