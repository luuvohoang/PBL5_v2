﻿// <auto-generated />
using Backend.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

#nullable disable

namespace Backend.Migrations
{
    [DbContext(typeof(ApplicationDbContext))]
    [Migration("20250311092052_InitialCreate")]
    partial class InitialCreate
    {
        /// <inheritdoc />
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "7.0.5")
                .HasAnnotation("Relational:MaxIdentifierLength", 128);

            SqlServerModelBuilderExtensions.UseIdentityColumns(modelBuilder);

            modelBuilder.Entity("Backend.Models.Product", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"));

                    b.Property<string>("Category")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Description")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("ImageUrl")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Manufacturer")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<decimal>("Price")
                        .HasColumnType("decimal(18,2)");

                    b.Property<int>("StockQuantity")
                        .HasColumnType("int");

                    b.HasKey("Id");

                    b.ToTable("Products");

                    b.HasData(
                        new
                        {
                            Id = 1,
                            Category = "cpu",
                            Description = "8-core, 16-thread processor",
                            ImageUrl = "/images/5800x.jpg",
                            Manufacturer = "AMD",
                            Name = "AMD Ryzen 7 5800X",
                            Price = 449.99m,
                            StockQuantity = 10
                        },
                        new
                        {
                            Id = 2,
                            Category = "gpu",
                            Description = "10GB GDDR6X Graphics Card",
                            ImageUrl = "/images/3080.jpg",
                            Manufacturer = "NVIDIA",
                            Name = "NVIDIA RTX 3080",
                            Price = 699.99m,
                            StockQuantity = 5
                        },
                        new
                        {
                            Id = 3,
                            Category = "motherboard",
                            Description = "AMD AM4 Gaming Motherboard",
                            ImageUrl = "/images/b550f.jpg",
                            Manufacturer = "ASUS",
                            Name = "ASUS ROG Strix B550-F",
                            Price = 189.99m,
                            StockQuantity = 15
                        });
                });
#pragma warning restore 612, 618
        }
    }
}
