#include <ctype.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>

#ifdef __EMSCRIPTEN__
#include <emscripten.h>
#else
#define EMSCRIPTEN_KEEPALIVE
#define EM_ASM(...)
#endif

#define MAX_EMPLOYEES 200
#define NAME_LENGTH 100
#define DEPARTMENT_LENGTH 100
#define ID_LENGTH 20
#define DATA_FILE "employees.dat"

typedef struct {
    char empId[ID_LENGTH];
    char name[NAME_LENGTH];
    char department[DEPARTMENT_LENGTH];
    double basicPay;
    double otHours;
    double otRate;
} Employee;

static Employee employees[MAX_EMPLOYEES];
static int employeeCount = 0;

static void trimNewline(char *text) {
    size_t length = strlen(text);
    if (length > 0 && text[length - 1] == '\n') {
        text[length - 1] = '\0';
    }
}

static void readLine(char *buffer, size_t size) {
    if (fgets(buffer, (int) size, stdin) == NULL) {
        buffer[0] = '\0';
        clearerr(stdin);
        return;
    }
    trimNewline(buffer);
}

static int isBlank(const char *text) {
    while (*text != '\0') {
        if (!isspace((unsigned char) *text)) {
            return 0;
        }
        text++;
    }
    return 1;
}

static void readRequiredString(const char *prompt, char *buffer, size_t size) {
    do {
        printf("%s", prompt);
        fflush(stdout);
        readLine(buffer, size);
        if (isBlank(buffer)) {
            printf("Input cannot be empty. Please try again.\n");
        }
    } while (isBlank(buffer));
}

static double readNonNegativeDouble(const char *prompt) {
    char input[128];
    char *endPtr = NULL;
    double value;

    while (1) {
        printf("%s", prompt);
        fflush(stdout);
        readLine(input, sizeof(input));

        value = strtod(input, &endPtr);
        if (input[0] == '\0' || endPtr == input || *endPtr != '\0') {
            printf("Invalid numeric input. Please enter a valid number.\n");
            continue;
        }

        if (value < 0) {
            printf("Negative values are not allowed.\n");
            continue;
        }

        return value;
    }
}

static int readMenuChoice(void) {
    char input[64];
    char *endPtr = NULL;
    long choice;

    while (1) {
        printf("Enter your choice: ");
        fflush(stdout);
        readLine(input, sizeof(input));

        choice = strtol(input, &endPtr, 10);
        if (input[0] == '\0' || endPtr == input || *endPtr != '\0') {
            printf("Invalid menu choice. Please enter a number from 1 to 7.\n");
            continue;
        }

        if (choice < 1 || choice > 7) {
            printf("Invalid menu choice. Please enter a number from 1 to 7.\n");
            continue;
        }

        return (int) choice;
    }
}

static int findEmployeeIndexById(const char *empId) {
    int index;
    for (index = 0; index < employeeCount; index++) {
        if (strcmp(employees[index].empId, empId) == 0) {
            return index;
        }
    }
    return -1;
}

double calculateGrossPay(Employee employee) {
    return employee.basicPay + (employee.otHours * employee.otRate);
}

double calculateTax(double grossPay) {
    if (grossPay <= 20000.0) {
        return 0.0;
    }
    if (grossPay <= 40000.0) {
        return grossPay * 0.10;
    }
    if (grossPay <= 70000.0) {
        return grossPay * 0.20;
    }
    return grossPay * 0.30;
}

double calculateNetPay(double grossPay, double taxAmount) {
    return grossPay - taxAmount;
}

static double getTotalGrossPay(void) {
    int index;
    double total = 0.0;
    for (index = 0; index < employeeCount; index++) {
        total += calculateGrossPay(employees[index]);
    }
    return total;
}

static double getTotalNetPay(void) {
    int index;
    double total = 0.0;
    for (index = 0; index < employeeCount; index++) {
        double gross = calculateGrossPay(employees[index]);
        total += calculateNetPay(gross, calculateTax(gross));
    }
    return total;
}

static void updateDashboardMetrics(void) {
    double totalGross = getTotalGrossPay();
    double totalNet = getTotalNetPay();

#ifndef __EMSCRIPTEN__
    (void) totalGross;
    (void) totalNet;
#endif

    EM_ASM({
        if (typeof window.updatePayrollMetrics === "function") {
            window.updatePayrollMetrics($0, $1, $2);
        }
    }, employeeCount, totalGross, totalNet);
}

static void clearPayslipCard(void) {
    EM_ASM({
        if (typeof window.clearPayslipCard === "function") {
            window.clearPayslipCard();
        }
    });
}

static void renderPayslipCard(const Employee *employee, double grossPay, double taxAmount, double netPay) {
    char generatedAt[32];
    time_t now = time(NULL);
    struct tm *timeInfo = localtime(&now);

#ifndef __EMSCRIPTEN__
    (void) employee;
    (void) grossPay;
    (void) netPay;
#endif

    if (timeInfo != NULL) {
        strftime(generatedAt, sizeof(generatedAt), "%d-%m-%Y", timeInfo);
    } else {
        strcpy(generatedAt, "N/A");
    }

    EM_ASM({
        if (typeof window.showPayslipCard === "function") {
            window.showPayslipCard(
                UTF8ToString($0),
                UTF8ToString($1),
                UTF8ToString($2),
                $3,
                $4,
                $5,
                $6,
                UTF8ToString($7)
            );
        }
    }, employee->name, employee->empId, employee->department, employee->basicPay,
       employee->otHours * employee->otRate, grossPay, netPay, generatedAt);

    (void) taxAmount;
}

static void syncPersistentStorage(void) {
    EM_ASM({
        if (typeof FS !== "undefined" && typeof FS.syncfs === "function") {
            FS.syncfs(false, function(error) {
                if (error) {
                    console.error("Failed to sync payroll data.", error);
                }
            });
        }
    });
}

void addEmployee(void) {
    Employee employee;

    if (employeeCount >= MAX_EMPLOYEES) {
        printf("Employee storage is full. Cannot add more records.\n");
        return;
    }

    while (1) {
        readRequiredString("Enter employee ID: ", employee.empId, sizeof(employee.empId));
        if (findEmployeeIndexById(employee.empId) != -1) {
            printf("Duplicate employee ID found. Please enter a unique ID.\n");
            continue;
        }
        break;
    }

    readRequiredString("Enter employee name: ", employee.name, sizeof(employee.name));
    readRequiredString("Enter department: ", employee.department, sizeof(employee.department));
    employee.basicPay = readNonNegativeDouble("Enter basic pay: ");
    employee.otHours = readNonNegativeDouble("Enter overtime hours: ");
    employee.otRate = readNonNegativeDouble("Enter overtime rate: ");

    employees[employeeCount] = employee;
    employeeCount++;

    printf("Employee added successfully.\n");
    updateDashboardMetrics();
}

void viewEmployees(void) {
    int index;

    if (employeeCount == 0) {
        printf("No employee records available.\n");
        return;
    }

    printf("\n================ EMPLOYEE RECORDS ================\n");
    for (index = 0; index < employeeCount; index++) {
        double grossPay = calculateGrossPay(employees[index]);
        double taxAmount = calculateTax(grossPay);
        double netPay = calculateNetPay(grossPay, taxAmount);

        printf("Employee %d\n", index + 1);
        printf("ID         : %s\n", employees[index].empId);
        printf("Name       : %s\n", employees[index].name);
        printf("Department : %s\n", employees[index].department);
        printf("Basic Pay  : %.2f\n", employees[index].basicPay);
        printf("OT Hours   : %.2f\n", employees[index].otHours);
        printf("OT Rate    : %.2f\n", employees[index].otRate);
        printf("Gross Pay  : %.2f\n", grossPay);
        printf("Tax        : %.2f\n", taxAmount);
        printf("Net Pay    : %.2f\n", netPay);
        printf("--------------------------------------------------\n");
    }
}

void searchEmployee(void) {
    char empId[ID_LENGTH];
    int index;
    double grossPay;
    double taxAmount;
    double netPay;

    readRequiredString("Enter employee ID to search: ", empId, sizeof(empId));
    index = findEmployeeIndexById(empId);

    if (index == -1) {
        printf("Employee not found.\n");
        return;
    }

    grossPay = calculateGrossPay(employees[index]);
    taxAmount = calculateTax(grossPay);
    netPay = calculateNetPay(grossPay, taxAmount);

    printf("\nEmployee found.\n");
    printf("ID         : %s\n", employees[index].empId);
    printf("Name       : %s\n", employees[index].name);
    printf("Department : %s\n", employees[index].department);
    printf("Basic Pay  : %.2f\n", employees[index].basicPay);
    printf("OT Hours   : %.2f\n", employees[index].otHours);
    printf("OT Rate    : %.2f\n", employees[index].otRate);
    printf("Gross Pay  : %.2f\n", grossPay);
    printf("Tax        : %.2f\n", taxAmount);
    printf("Net Pay    : %.2f\n", netPay);
}

void generatePayslip(void) {
    char empId[ID_LENGTH];
    int index;
    double grossPay;
    double taxAmount;
    double netPay;

    readRequiredString("Enter employee ID for payslip generation: ", empId, sizeof(empId));
    index = findEmployeeIndexById(empId);

    if (index == -1) {
        printf("Employee not found.\n");
        clearPayslipCard();
        return;
    }

    grossPay = calculateGrossPay(employees[index]);
    taxAmount = calculateTax(grossPay);
    netPay = calculateNetPay(grossPay, taxAmount);

    printf("\n==================== PAYSLIP ====================\n");
    printf("Employee ID : %s\n", employees[index].empId);
    printf("Name        : %s\n", employees[index].name);
    printf("Department  : %s\n", employees[index].department);
    printf("Basic Pay   : %.2f\n", employees[index].basicPay);
    printf("OT Hours    : %.2f\n", employees[index].otHours);
    printf("OT Rate     : %.2f\n", employees[index].otRate);
    printf("Gross Pay   : %.2f\n", grossPay);
    printf("Tax Amount  : %.2f\n", taxAmount);
    printf("Net Pay     : %.2f\n", netPay);
    printf("=================================================\n");

    renderPayslipCard(&employees[index], grossPay, taxAmount, netPay);
}

void saveToFile(void) {
    FILE *file = fopen(DATA_FILE, "wb");

    if (file == NULL) {
        printf("Unable to save records to file.\n");
        return;
    }

    fwrite(&employeeCount, sizeof(employeeCount), 1, file);
    if (employeeCount > 0) {
        fwrite(employees, sizeof(Employee), (size_t) employeeCount, file);
    }
    fclose(file);

    printf("Records saved successfully to %s.\n", DATA_FILE);
    syncPersistentStorage();
}

void loadFromFile(void) {
    FILE *file = fopen(DATA_FILE, "rb");
    int loadedCount;

    if (file == NULL) {
        printf("No saved file found yet. Starting with empty records.\n");
        employeeCount = 0;
        updateDashboardMetrics();
        return;
    }

    if (fread(&loadedCount, sizeof(loadedCount), 1, file) != 1) {
        fclose(file);
        printf("Saved file could not be read correctly.\n");
        return;
    }

    if (loadedCount < 0 || loadedCount > MAX_EMPLOYEES) {
        fclose(file);
        printf("Saved file contains invalid employee data.\n");
        return;
    }

    employeeCount = loadedCount;
    if (employeeCount > 0) {
        if (fread(employees, sizeof(Employee), (size_t) employeeCount, file) != (size_t) employeeCount) {
            fclose(file);
            employeeCount = 0;
            printf("Employee records could not be loaded completely.\n");
            updateDashboardMetrics();
            return;
        }
    }

    fclose(file);
    printf("%d employee record(s) loaded successfully from %s.\n", employeeCount, DATA_FILE);
    updateDashboardMetrics();
}

static void displayMenu(void) {
    printf("\n========== EMPLOYEE PAYROLL SYSTEM ==========\n");
    printf("1. Add employee\n");
    printf("2. View all employees\n");
    printf("3. Search employee by ID\n");
    printf("4. Generate payslip\n");
    printf("5. Save records to file\n");
    printf("6. Load records from file\n");
    printf("7. Exit\n");
}

int main(void) {
    int choice;

    setvbuf(stdout, NULL, _IONBF, 0);
    setvbuf(stdin, NULL, _IONBF, 0);

    printf("Employee Payroll System started.\n");
    printf("Data file: %s\n", DATA_FILE);
    loadFromFile();

    while (1) {
        displayMenu();
        choice = readMenuChoice();

        switch (choice) {
            case 1:
                addEmployee();
                break;
            case 2:
                viewEmployees();
                break;
            case 3:
                searchEmployee();
                break;
            case 4:
                generatePayslip();
                break;
            case 5:
                saveToFile();
                break;
            case 6:
                loadFromFile();
                break;
            case 7:
                printf("Exiting Employee Payroll System.\n");
                return 0;
            default:
                printf("Invalid menu choice. Please try again.\n");
        }
    }
}
